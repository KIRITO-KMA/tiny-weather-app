import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

type GeoResult = {
  results?: Array<{ name: string; country: string; latitude: number; longitude: number }>;
};

type MeteoResp = {
  current_weather: {
    temperature: number;
    windspeed: number;
    weathercode: number;
    time: string; // ISO dans la timezone auto
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
    visibility: number[];
    surface_pressure: number[];
    relative_humidity_2m: number[];
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    sunrise: string[];
    sunset: string[];
    uv_index_max: number[];
    precipitation_probability_max: number[];
  };
};

@Injectable({ providedIn: 'root' })
export class WeatherService {
  constructor(private http: HttpClient) {}

  private wmoToText(code: number): string {
    const t: Record<number, string> = {
      0:'☀️ Ciel dégagé',1:'🌤️ Plutôt clair',2:'⛅ Partiellement nuageux',3:'☁️ Couvert',
      45:'🌫️ Brouillard',48:'🌫️ Brouillard givrant',
      51:'🌦️ Bruine légère',53:'🌦️ Bruine modérée',55:'🌧️ Bruine forte',
      61:'🌦️ Pluie faible',63:'🌧️ Pluie modérée',65:'🌧️ Pluie forte',
      66:'🌧️ Pluie verglaçante faible',67:'🌧️ Pluie verglaçante forte',
      71:'🌨️ Neige faible',73:'🌨️ Neige modérée',75:'❄️ Neige forte',
      77:'🌨️ Grains de neige',
      80:'🌧️ Averses faibles',81:'🌧️ Averses modérées',82:'🌧️ Averses fortes',
      85:'🌨️ Averses de neige faibles',86:'🌨️ Averses de neige fortes',
      95:'⛈️ Orage',96:'⛈️ Orage grêle léger',99:'🌩️ Orage grêle fort'
    };
    return t[code] ?? `Code météo ${code}`;
  }
  private wmoToEmoji(code: number): string { return this.wmoToText(code).split(' ')[0]; }
  private wmoToColor(code: number): string {
    if ([0,1].includes(code)) return 'linear-gradient(to top, #48c6ef, #6f86d6)';
    if ([2,3].includes(code)) return 'linear-gradient(to top, #bdc3c7, #2c3e50)';
    if ([61,63,65,80,81,82].includes(code)) return 'linear-gradient(to top, #00c6fb, #005bea)';
    if ([71,73,75,85,86].includes(code)) return 'linear-gradient(to top, #e0eafc, #cfdef3)';
    if ([95,96,99].includes(code)) return 'linear-gradient(to top, #200122, #6f0000)';
    return 'linear-gradient(to top, #e0eafc, #8e9eab)';
  }
  private uvText(uvi: number): string {
    if (uvi < 3) return 'le plus faible';
    if (uvi < 6) return 'modéré';
    if (uvi < 8) return 'élevé';
    if (uvi < 11) return 'très élevé';
    return 'extrême';
  }

  async getWeatherByCity(city: string) {
    const name = city.trim();
    if (!name) throw new Error('Ville vide');

    // 1) Géocodage
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&language=fr&format=json`;
    const geo = await firstValueFrom(this.http.get<GeoResult>(geoUrl));
    const place = geo.results?.[0];
    if (!place) throw new Error(`Ville introuvable: "${name}"`);

    // 2) Météo (actuel + séries)
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}` +
      `&current_weather=true` +
      `&hourly=temperature_2m,weather_code,visibility,surface_pressure,relative_humidity_2m` +
      `&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max` +
      `&timezone=auto`;

    const m = await firstValueFrom(this.http.get<MeteoResp>(url));
    const c = m.current_weather.weathercode;

    // --- HUMIDITÉ alignée à l'heure courante ---
    let humidity = 0;
    let currentIdx = -1;
    const nowIso = m.current_weather.time;           // ex: "2025-08-29T16:20"
    const nowHourKey = nowIso.slice(0, 13);          // "YYYY-MM-DDTHH"
    if (m.hourly?.time?.length) {
      currentIdx = m.hourly.time.indexOf(nowIso);
      if (currentIdx === -1) {
        currentIdx = m.hourly.time.findIndex(t => t.slice(0, 13) === nowHourKey);
      }
      if (currentIdx === -1) {
        const now = new Date(nowIso).getTime();
        let best = -1, bestTs = -Infinity;
        for (let i = 0; i < m.hourly.time.length; i++) {
          const ts = new Date(m.hourly.time[i]).getTime();
          if (ts <= now && ts > bestTs) { bestTs = ts; best = i; }
        }
        currentIdx = best;
      }
      if (currentIdx !== -1 && m.hourly.relative_humidity_2m?.[currentIdx] != null) {
        humidity = m.hourly.relative_humidity_2m[currentIdx];
      }
    }

    // --- Prochaines HEURES restantes aujourd'hui ---
    const today = nowIso.slice(0, 10);
    const hours: { time: string; temp: number; emoji: string }[] = [];
    if (currentIdx !== -1) {
      for (let i = currentIdx; i < m.hourly.time.length; i++) {
        const ts = m.hourly.time[i];
        if (!ts.startsWith(today)) break;
        hours.push({
          time: new Date(ts).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          temp: Math.round(m.hourly.temperature_2m[i]),
          emoji: this.wmoToEmoji(m.hourly.weather_code[i])
        });
      }
    }

    // --- Progression du soleil + couleur dynamique ---
    const sunriseDate = new Date(m.daily.sunrise[0]);
    const sunsetDate  = new Date(m.daily.sunset[0]);
    const nowDate     = new Date(nowIso);

    let sunProgress = 0;
    if (nowDate <= sunriseDate) sunProgress = 0;
    else if (nowDate >= sunsetDate) sunProgress = 100;
    else {
      sunProgress = ((nowDate.getTime() - sunriseDate.getTime()) / (sunsetDate.getTime() - sunriseDate.getTime())) * 100;
    }

    // couleur qui évolue avec la journée : matin (jaune) -> midi (orange) -> soir (bleu doux)
    let sunColor = '#f6d365'; // matin
    if (sunProgress >= 33 && sunProgress < 66) sunColor = '#fda085'; // midi
    else if (sunProgress >= 66) sunColor = '#4b79a1';                // soir/nuit douce

    // --- 7 prochains jours ---
    const days = (m.daily.time || []).slice(0, 7).map((d, i) => ({
      date: new Date(d),
      label: new Date(d).toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: '2-digit' }),
      max: Math.round(m.daily.temperature_2m_max[i]),
      min: Math.round(m.daily.temperature_2m_min[i]),
      emoji: this.wmoToEmoji(c)
    }));

    return {
      city: `${place.name} (${place.country})`,
      temp: Math.round(m.current_weather.temperature),
      feels: Math.round(m.current_weather.temperature), // pas d'apparent_temperature en current_weather
      humidity,
      wind: Math.round(m.current_weather.windspeed),
      desc: this.wmoToText(c),
      color: this.wmoToColor(c),

      uvIndex: m.daily.uv_index_max?.[0] ?? 0,
      uvText: this.uvText(m.daily.uv_index_max?.[0] ?? 0),
      pressure: Math.round(m.hourly.surface_pressure?.[currentIdx] ?? m.hourly.surface_pressure?.[0] ?? 0),
      precipProb: m.daily.precipitation_probability_max?.[0] ?? 0,
      visibilityKm: Math.round((m.hourly.visibility?.[currentIdx] ?? m.hourly.visibility?.[0] ?? 0) / 1000),

      sunrise: sunriseDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      sunset:  sunsetDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      sunProgress,                 // 0 → 100
      sunColor,                    // couleur du côté "coucher"

      max: Math.round(m.daily.temperature_2m_max[0]),
      min: Math.round(m.daily.temperature_2m_min[0]),
      hours,
      days
    };
  }
}
