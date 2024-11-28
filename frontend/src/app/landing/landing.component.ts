import { Component } from '@angular/core';
import { LoginComponent } from '../login/login.component'; // Ruta relativa al componente Login
import { RegistroComponent } from '../registro/registro.component'; // Ruta relativa al componente Registro
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-landing',
  standalone: true,
  
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
  imports: [CommonModule,LoginComponent, RegistroComponent] // Importa los componentes standalone aquí
})
export class LandingComponent {
  mostrarLogin: boolean = false;

  alternarVista() {
    this.mostrarLogin = !this.mostrarLogin;
  }
}
