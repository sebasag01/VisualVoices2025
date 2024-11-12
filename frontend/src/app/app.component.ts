import { Component, OnInit } from '@angular/core';
import { ApiService } from './services/api.service';
import { CommonModule } from '@angular/common'; // Importa CommonModule para tener acceso a directivas como *ngIf y *ngFor
import { UsuariosComponent } from './usuarios/usuarios.component'; // Importar UsuariosComponent

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [CommonModule,UsuariosComponent]
})
export class AppComponent implements OnInit {
  title = 'frontend';
  response: any;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.apiService.getHelloWorld().subscribe(
      data => {
        this.response = data;
        console.log('Respuesta de la API:', this.response);
      },
      error => {
        console.error('Error al obtener datos:', error);
      }
    );
  }
}
