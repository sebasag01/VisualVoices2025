import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CanvasComponent } from '../canvas/canvas.component';
import { UsuariosService } from '../services/usuarios.service';
import { PalabrasService } from '../services/palabras.service';
import { ExploredWordsService } from '../services/explored_word.service';import { BookOpen, Compass, Target } from 'lucide-react';
import { HeaderComponent } from '../header/header.component';
import { StatsService } from '../services/stats.service';

@Component({
  standalone: true,
  selector: 'app-mode-selector',
  templateUrl: './modos.component.html',
  styleUrls: ['./modos.component.css'],
  imports: [CommonModule, CanvasComponent, HeaderComponent],
})
export class ModosComponent {

  navigateTo(destination: string) {
    if (destination === 'admin') {
      this.router.navigate(['/admin']);
    } else if (destination === 'perfil') {
      this.router.navigate(['/perfil']);
    }
  }

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
  currentStatsId: string | null = null; // Asegúrate de almacenar el ID de la sesión

  constructor(private router: Router,
    private usuariosService: UsuariosService,
    private palabrasService: PalabrasService,
    private exploredWordsService: ExploredWordsService,
    private statsService: StatsService) {};


  // MODO GUIADO
  progressPercent = 0;
  maxWords = 3; // Límite de palabras en modo guiado
  userLevel = 1; // Por defecto
  nextLevel: number | null = null; // Próximo nivel, si existe

  // MODO LIBRE
  totalWords = 0;       // total global de palabras (o si prefieres, total de una categoría)
  exploredCount = 0;    // cuántas ha explorado el usuario
  mostExploredCategoryName: string | null = null;
  mostExploredCategoryCount: number | null = null;
  tiempoLibreMs: number = 0;

  private refreshInterval: any;


  //angel

  ngOnInit(): void {
    // 1) Obtener el usuario
    this.usuariosService.getAuthenticatedUser().subscribe({
      next: (resp) => {
        const user = resp.usuario;

        // --- GUIADO ---
        this.userLevel = user.currentLevel || 1;
        this.progressPercent = Math.floor(
          ((user.currentWordIndex + 1) / this.maxWords) * 100
        );

        // --- LIBRE ---
        const initialExploredCount = user.exploredFreeWords ? user.exploredFreeWords.length : 0;
        console.log('Inicializando exploredCount con valor:', initialExploredCount);
        this.exploredWordsService.setExploredCount(initialExploredCount);

        // Suscribirse a cambios en exploredCount
        this.exploredWordsService.exploredCount$.subscribe((count) => {
          this.exploredCount = count;
          console.log('Modos - exploredCount actualizado a', count);
        });

        // Obtener la categoría más explorada
        this.usuariosService.getCategoriaMasExplorada(user.uid).subscribe({
          next: (respCat) => {
            if (respCat.ok && respCat.categoriaMasExplorada) {
              this.mostExploredCategoryName = respCat.categoriaMasExplorada.nombre;
              this.mostExploredCategoryCount = respCat.categoriaMasExplorada.count;
              console.log(
                'Categoría más explorada:',
                this.mostExploredCategoryName,
                'con',
                this.mostExploredCategoryCount,
                'palabras'
              );
            } else {
              console.log('Ninguna categoría explorada aún');
            }
          },
          error: (err) => {
            console.error('Error obteniendo la categoría más explorada:', err);
          }
        });

        // Iniciar la actualización periódica del tiempo total en modo libre
        this.startRefreshTiempoLibre(user.uid);
      },
      error: (err) => {
        console.error('Error obteniendo usuario:', err);
        // En caso de error, nos suscribimos a exploredCount como respaldo
        this.exploredWordsService.exploredCount$.subscribe((count) => {
          this.exploredCount = count;
          console.log('Modos - exploredCount actualizado a', count);
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

  // Método para refrescar el tiempo total en modo libre
  startRefreshTiempoLibre(userId: string): void {
    // Hacemos una primera llamada
    this.refreshTiempoLibre(userId);
    // Y luego configuramos un intervalo para refrescar cada minuto (60000 ms)
    this.refreshInterval = setInterval(() => {
      console.log('Refrescando tiempo total en modo libre...');
      this.refreshTiempoLibre(userId);
    }, 10000);
  }

  refreshTiempoLibre(userId: string): void {
    this.statsService.getTiempoTotalLibre(userId).subscribe({
      next: (resp) => {
        if (resp.ok) {
          this.tiempoLibreMs = resp.totalDurationMs;
          console.log('Actualización - Tiempo total Modo Libre (ms):', this.tiempoLibreMs);
        } else {
          console.log('Respuesta ok false en getTiempoTotalLibre:', resp.msg);
        }
      },
      error: (err) => {
        console.error('Error al obtener tiempo total libre:', err);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.currentStatsId) {
      this.statsService.endMode(this.currentStatsId).subscribe({
        next: (resp) => {
          console.log('Sesión de modo libre cerrada. Duración (ms):', resp.durationMs);
        },
        error: (err) => console.error('Error al cerrar la sesión de modo libre:', err)
      });
    }
  }

  navigateToMode(route: string) {
    this.router.navigate([route]);
  }
}
