import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CanvasComponent } from '../canvas/canvas.component';
import { UsuariosService } from '../services/usuarios.service';
import { PalabrasService } from '../services/palabras.service';
import { ExploredWordsService } from '../services/explored_word.service';import { BookOpen, Compass, Target } from 'lucide-react';
import { HeaderComponent } from '../header/header.component';


@Component({
  standalone: true,
  selector: 'app-mode-selector',
  templateUrl: './modos.component.html',
  styleUrls: ['./modos.component.css'],
  imports: [CommonModule, CanvasComponent, HeaderComponent],
})
export class ModosComponent {
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

  constructor(private router: Router,
    private usuariosService: UsuariosService,
    private palabrasService: PalabrasService,
    private exploredWordsService: ExploredWordsService) {};


  // MODO GUIADO
  progressPercent = 0;
  maxWords = 3; // Límite de palabras en modo guiado
  userLevel = 1; // Por defecto
  nextLevel: number | null = null; // Próximo nivel, si existe

  // MODO LIBRE
  totalWords = 0;       // total global de palabras (o si prefieres, total de una categoría)
  exploredCount = 0;    // cuántas ha explorado el usuario

  //angel

  ngOnInit(): void {
    // Primero carga el usuario para obtener el valor inicial
    this.usuariosService.getAuthenticatedUser().subscribe({
      next: (resp) => {
        const user = resp.usuario;
        
        // --- GUIADO ---
        this.userLevel = user.currentLevel || 1;
        this.progressPercent = Math.floor(
          ((user.currentWordIndex + 1) / this.maxWords) * 100
        );
        
        // ... resto del código para el nivel ...
        
        // --- LIBRE ---
        // IMPORTANTE: Primero establece el contador desde los datos del usuario
        const initialExploredCount = user.exploredFreeWords ? user.exploredFreeWords.length : 0;
        console.log("Inicializando exploredCount con valor:", initialExploredCount);
        this.exploredWordsService.setExploredCount(initialExploredCount);
        
        // Luego suscríbete a cambios futuros
        this.exploredWordsService.exploredCount$.subscribe((count) => {
          this.exploredCount = count;
          console.log("Modos - exploredCount actualizado a", count);
        });
      },
      error: (err) => {
        console.error('Error obteniendo usuario:', err);
        
        // Suscripción de respaldo en caso de error
        this.exploredWordsService.exploredCount$.subscribe((count) => {
          this.exploredCount = count;
          console.log("Modos - exploredCount actualizado a", count);
        });
      }
    });
    
    // 2) Cargar el total de palabras
    this.palabrasService.obtenerPalabras().subscribe({
      next: (allPalabras) => {
        this.totalWords = allPalabras.length;
      },
      error: (err) => {
        console.error('Error obteniendo total de palabras:', err);
      }
    });
  }

  navigateToMode(route: string) {
    this.router.navigate([route]);
  }
}

