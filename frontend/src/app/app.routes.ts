import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegistroComponent } from './registro/registro.component';
import { LandingComponent } from './landing/landing.component';
import { PruebasComponent } from './pruebas/pruebas.component';
// import { HomeComponent } from './home/home.component';
import { ModoGuiadoComponent } from './modo-guiado/modo-guiado.component';
import { ModosComponent } from './modos/modos.component';
import { TestUploadComponent } from './test-upload/test-upload.component';
import { AdminGuard } from './guards/admin.guard'; // Importa el guardia
import { AdminComponent } from './admin/admin.component';
import { AdminRoleGuard } from './guards/admin-role.guard';
import { AdminUsuariosComponent } from './admin/admin_usuarios.component';
import { AdminPalabrasComponent } from './admin/admin_palabras.component';
import { AdminCategoriasComponent } from './admin/admin_categorias.component';
import { AdminEstadisticasComponent } from './admin/admin_estadisticas.component'; // Importarlo

import { MiperfilComponent } from './miperfil/miperfil.component';
import { ModoLibreComponent } from './modo-libre/modo-libre.component';
import { ModoExamenComponent } from './modo-examen/modo-examen.component';
import { ModoVersusComponent } from './modo-versus/modo-versus.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'modos', component: ModosComponent },
  { path: 'landing', component: LandingComponent },
  {path: 'perfil', component: MiperfilComponent },
  { path: 'admin', component: AdminComponent, canActivate: [AdminRoleGuard], 
    children: [
      { path: '', redirectTo: 'usuarios', pathMatch: 'full' },
      { path: 'usuarios', component: AdminUsuariosComponent },
      { path: 'palabras', component: AdminPalabrasComponent },
      { path: 'categorias', component: AdminCategoriasComponent },
      { path: 'estadisticas', component: AdminEstadisticasComponent }
    ] 
  },
  { path: 'pruebas', component: PruebasComponent }, 
  { path: 'guiado', component: ModoGuiadoComponent },
  { path: 'libre', component: ModoLibreComponent },
  { path: 'examen', component: ModoExamenComponent },
  { path: 'versus', component: ModoVersusComponent },
  { path: 'test-upload', component: TestUploadComponent, canActivate: [AdminRoleGuard] }, //canActivate: [AdminGuard] }, // Protege esta ruta
  { path: '**', redirectTo: 'landing' },
];

