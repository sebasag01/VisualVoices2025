import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { importProvidersFrom } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(HttpClientModule) // Asegúrate de que HttpClientModule esté disponible
  ]
}).catch(err => console.error(err));
bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));

  
