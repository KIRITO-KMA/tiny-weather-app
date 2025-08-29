import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app'; // alias résolu vers app.ts
import { provideHttpClient } from '@angular/common/http';

bootstrapApplication(AppComponent, {
  providers: [provideHttpClient()]
}).catch(err => console.error(err));
