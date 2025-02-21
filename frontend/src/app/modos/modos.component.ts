// import { Component } from '@angular/core';
// import { CanvasComponent } from '../canvas/canvas.component';
// import { environment } from '../../environments/environment';


// @Component({
//   selector: 'app-modos',
//   standalone: true,
//   imports: [],
//   templateUrl: './modos.component.html',
//   styleUrl: './modos.component.css'
// })
// export class ModosComponent {

// }

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CanvasComponent } from '../canvas/canvas.component';


@Component({
  standalone: true,
  selector: 'app-mode-selector',
  templateUrl: './modos.component.html',
  styleUrls: ['./modos.component.css'],
  imports: [CommonModule, CanvasComponent]
})
export class ModosComponent {
  modes = [
    { id: 'guiado', name: 'MODO GUIADO', description: 'Aprende paso a paso con un recorrido estructurado', route: '/guiado' },
    { id: 'libre', name: 'MODO LIBRE', description: 'Explora y practica a tu ritmo según tu interés', route: '/libre' },
    { id: 'examen', name: 'MODO EXAMEN', description: 'Pon a prueba tus conocimientos y mide tu progreso', route: '/home' }
  ];

  currentAnimationUrls: string[] = [];  // <-- Agrega esta línea para evitar el error


  constructor(private router: Router) {}

  navigateToMode(route: string) {
    this.router.navigate([route]);
  }
}

