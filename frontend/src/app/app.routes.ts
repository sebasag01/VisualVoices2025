import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegistroComponent } from './registro/registro.component';
import { LandingComponent } from './landing/landing.component';
import { PruebasComponent } from './pruebas/pruebas.component';

export const routes: Routes = [
  { path: '', redirectTo: 'landing', pathMatch: 'full' }, 
  { path: 'landing', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'pruebas', component: PruebasComponent }, 
];
