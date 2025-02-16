import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { CanvasComponent } from '../canvas/canvas.component';



@Component({
  standalone: true,
  selector: 'app-mode-selector',
  templateUrl: './mode-selector.component.html',
  styleUrls: ['./mode-selector.component.css'],
  imports: [CommonModule, HeaderComponent, CanvasComponent]
  
})
export class ModeSelectorComponent {
  modes = [
    { id: 'guiado', name: 'MODO GUIADO', description: 'Aprende paso a paso con un recorrido estructurado', route: '/guiado' },
    { id: 'libre', name: 'MODO LIBRE', description: 'Explora y practica a tu ritmo según tu interés', route: '/home' },
    { id: 'examen', name: 'MODO EXAMEN', description: 'Pon a prueba tus conocimientos y mide tu progreso', route: '/examen' }
    
  ];
  currentAnimationUrls: string[] = []; // URLs de las animaciones seleccionadas


  constructor(private router: Router) {}

  navigateToMode(route: string) {
    this.router.navigate([route]);
  }
}
