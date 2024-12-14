import { Component, OnInit } from '@angular/core';
import { ApiService } from './services/api.service';
import { CommonModule } from '@angular/common'; // Importa CommonModule para tener acceso a directivas como *ngIf y *ngFor
import { UsuariosComponent } from './usuarios/usuarios.component'; // Importar UsuariosComponent
import { RouterModule,Router  } from '@angular/router';
import { HeaderComponent } from "./header/header.component"; // Importar RouterModule para router-outlet
import { UsuariosService } from './services/usuarios.service'; 
import { response } from 'express';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [CommonModule, UsuariosComponent, RouterModule, HeaderComponent]
})
export class AppComponent implements OnInit {
  title = 'frontend';
  response: any;
  usuario: any = null;

  constructor(private apiService: ApiService, private usuariosService: UsuariosService, private router: Router) {}

  ngOnInit() {
    this.apiService.getHelloWorld().subscribe({
      next: (data) => {
        this.response = data;
        console.log('Respuesta de la API:', this.response);
      },
      error: (error) => {
        console.error('Error al obtener datos:', error);
        if (error.error instanceof ProgressEvent) {
          console.error('Parece que la respuesta no es un JSON válido o el servidor no está disponible.');
        }
      },
    });

    // Intentar cargar datos del usuario autenticado si existe un token
    this.cargarUsuarioAutenticado();
    this.redirigirSiAutenticado();

  }

  redirigirSiAutenticado(): void {
    const token = this.getCookie('token');
    if (token) {
      console.log('[DEBUG] Redirigiendo a /home debido a token presente');
      this.router.navigate(['/home']);
    } else {
      console.log('[DEBUG] Redirigiendo a /landing debido a falta de token');
      this.router.navigate(['/landing']);
    }
  }

  cargarUsuarioAutenticado(): void {
  console.log('[DEBUG] Verificando autenticación mediante el backend...');

  this.usuariosService.getAuthenticatedUser().subscribe({
    next: (response) => {
      console.log('[DEBUG] Respuesta de la API /login/usuario:', response);

      this.usuario = response.usuario; // Guardar el usuario autenticado
      console.log('[DEBUG] Usuario autenticado cargado:', this.usuario);

      // Redirigir al home si el usuario está autenticado y está en landing
      if (this.router.url === '/landing') {
        console.log('[DEBUG] Redirigiendo a /home');
        this.router.navigate(['/home']);
      }
    },
    error: (error) => {
      console.error('[ERROR] No autenticado o token inválido:', error);

      // Limpiar estado y redirigir al landing
      this.usuario = null;
      this.router.navigate(['/landing']);
    },
  });
}
  getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  }
  
}
