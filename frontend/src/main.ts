import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { importProvidersFrom } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { routes } from './app/app.routes'; // Asegúrate de que este archivo contiene tus rutas

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      HttpClientModule, 
      RouterModule.forRoot(routes) // Aquí se registran las rutas de tu aplicación
    )
  ]
}).catch(err => console.error(err));
