import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CanvasComponent } from '../canvas/canvas.component';
import { BookOpen, Compass, Target } from 'lucide-react';
import { HeaderComponent } from '../header/header.component';


@Component({
  standalone: true,
  selector: 'app-mode-selector',
  templateUrl: './modos.component.html',
  styleUrls: ['./modos.component.css'],
  imports: [CommonModule, CanvasComponent, HeaderComponent],
})
export class ModosComponent {

  
  
  progresoAprende = 30; // Valor de progreso dinámico
  leccionActual = "Lección 3"; // Se puede obtener de un servicio
  ultimaPalabra = "Ejemplo"; // Última palabra aprendida
  modes = [
    {
      id: 'guiado',
      icon: 'assets/aprende.png',
      name: 'APRENDE',
      description: 'paso a paso estructuradamente',
      route: '/guiado',
    },
    {
      id: 'libre',
      icon: 'assets/explora.png',
      name: 'EXPLORA',
      description: 'y practica a tu ritmo según tu interés',
      route: '/libre',
    },
    {
      id: 'examen',
      icon: 'assets/retate.png',
      name: 'RÉTATE',
      description: 'poniendo a prueba tus conocimientos',
      route: '/home',
    },
  ];

  currentAnimationUrls: string[] = []; // <-- Agrega esta línea para evitar el error

  constructor(private router: Router) {}

  navigateToMode(route: string) {
    this.router.navigate([route]);
  }

  navigateTo(destination: string) {
    if (destination === 'admin') {
      this.router.navigate(['/admin']);
    } else if (destination === 'ajustes') {
      this.router.navigate(['/ajustes']);
    } else if (destination === 'perfil') {
      this.router.navigate(['/perfil']);
    }
  }
}
