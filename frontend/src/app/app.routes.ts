import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegistroComponent } from './registro/registro.component';

export const routes: Routes = [
  { path: '', component: LoginComponent }, // Ruta raíz que carga LoginComponent
  { path: 'registro', component: RegistroComponent } // Ruta del registro
];

