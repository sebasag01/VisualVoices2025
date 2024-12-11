import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegistroComponent } from './registro/registro.component';
import { LandingComponent } from './landing/landing.component';
import { PruebasComponent } from './pruebas/pruebas.component';
import { HomeComponent } from './home/home.component';
import { ModoGuiadoComponent } from './modo-guiado/modo-guiado.component';

export const routes: Routes = [
  { path: '', redirectTo: 'landing', pathMatch: 'full' }, 
  { path: 'landing', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'pruebas', component: PruebasComponent }, 
  { path: 'home', component: HomeComponent },
  { path: 'guiado', component: ModoGuiadoComponent },
  
];
