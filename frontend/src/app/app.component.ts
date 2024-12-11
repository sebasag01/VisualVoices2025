import { Component, OnInit } from '@angular/core';
import { ApiService } from './services/api.service';
import { CommonModule } from '@angular/common'; // Importa CommonModule para tener acceso a directivas como *ngIf y *ngFor
import { UsuariosComponent } from './usuarios/usuarios.component'; // Importar UsuariosComponent
import { RouterModule } from '@angular/router';
import { HeaderComponent } from "./header/header.component"; // Importar RouterModule para router-outlet


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

  constructor(private apiService: ApiService) {}

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
  }
}
