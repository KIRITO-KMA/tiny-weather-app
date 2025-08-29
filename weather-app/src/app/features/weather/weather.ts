import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WeatherService } from './weather.service';

type HourItem = { time: string; temp: number; emoji: string; };
type DayItem  = { label: string; max: number; min: number; emoji: string; };

type WeatherView = {
  city: string;
  temp: number;
  feels: number;
  humidity: number;
  wind: number;
  desc: string;
  color: string;

  uvIndex: number;
  uvText: string;
  pressure: number;
  precipProb: number;
  visibilityKm: number;

  sunrise: string;
  sunset: string;
  sunProgress: number;  // 0 → 100
  sunColor: string;     // couleur du côté "coucher"

  max: number;
  min: number;

  hours: HourItem[];    // heures restantes aujourd’hui
  days: DayItem[];      // 7 jours
};

@Component({
  selector: 'app-weather',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './weather.html',
  styleUrls: ['./weather.scss']
})
export class WeatherComponent {
  @Output() colorChange = new EventEmitter<string>();

  city = 'Paris';
  loading = signal(false);
  error = signal<string | null>(null);
  data = signal<WeatherView | null>(null);

  constructor(private weather: WeatherService) {}

  async search() {
    this.error.set(null);
    this.data.set(null);
    this.loading.set(true);
    try {
      const res = await this.weather.getWeatherByCity(this.city);
      this.data.set(res);
      this.colorChange.emit(res.color);
    } catch (e: any) {
      this.error.set(e?.message ?? 'Erreur inconnue');
    } finally {
      this.loading.set(false);
    }
  }

  onEnter(ev: KeyboardEvent) {
    if (ev.key === 'Enter') this.search();
  }
}
