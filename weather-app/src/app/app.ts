import { Component, signal } from '@angular/core';
import { WeatherComponent } from './features/weather/weather';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [WeatherComponent],
  template: `
    <div class="page" [style.background]="bg()">
      <main class="container">
        <h1>Mini App Météo</h1>
        <app-weather (colorChange)="onColor($event)" />
      </main>
    </div>
  `,
  styles: [`
    :host { display:block; }
    .page {
      min-height: 100vh;
      background: linear-gradient(to top, #e0eafc, #8e9eab);
      background-attachment: fixed;
    }
    .container {
      padding: 2rem 1rem 3rem;
      max-width: 900px;
      margin: 0 auto;
      color: #0f172a;
    }
    h1 { text-align:center; margin: 0 0 1rem; }
  `]
})
export class AppComponent {
  private readonly defaultBg =
    'linear-gradient(to top, #e0eafc, #8e9eab)';

  bg = signal<string>(this.defaultBg);

  onColor(color: string) {
    this.bg.set(color || this.defaultBg);
  }
}
