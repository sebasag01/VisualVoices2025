import { Component, OnInit } from '@angular/core';
import { ApiService } from './services/api.service';
import { RouterOutlet } from '@angular/router';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule], 
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
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
