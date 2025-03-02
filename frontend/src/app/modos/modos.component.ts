import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CanvasComponent } from '../canvas/canvas.component';
import { UsuariosService } from '../services/usuarios.service';
import { PalabrasService } from '../services/palabras.service';
import { ExploredWordsService } from '../services/explored_word.service';
import { HeaderComponent } from '../header/header.component';
import { StatsService } from '../services/stats.service';
import { CategoriasService } from '../services/categorias.service';

const MODES = [
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
    route: '/modos',
  },
];

@Component({
  standalone: true,
  selector: 'app-mode-selector',
  templateUrl: './modos.component.html',
  styleUrls: ['./modos.component.css'],
  imports: [CommonModule, CanvasComponent, HeaderComponent],
})
export class ModosComponent implements OnInit, OnDestroy {

  modes = MODES;

  currentAnimationUrls: string[] = [];
  currentStatsId: string | null = null;
  categoriaSugerida: any = null;
  isNewUserInGuidedMode = true;
  animatedProgress = 0;
  wordsLearnedInLevel = 0;
  isNewUserInFreeMode = false;

  //ESTADO DEL USUARIO EN MODO GUIADO
  progressPercent = 0;
  maxWords = 3;
  userLevel = 1;
  nextLevel: number | null = null;
  totalWordsInLevel = 1;
  lastWordLearned: string = 'Adéntrate aprendiendo nuevas palabras';

  // MODO LIBRE
  totalWords = 0;
  exploredCount = 0;
  mostExploredCategoryName: string | null = null;
  mostExploredCategoryCount: number | null = null;
  tiempoLibreMs: number = 0;
  animatedProgressColor = 'custom-purple';

  // Estadísticas para Modo Guiado
  guidedStats = {
    progress: 0,
    wordsLearned: 0,
    level: 1,
    totalWordsInLevel: 0,
    nextLevel: 2,
    lastWordLearned: 'Adéntrate aprendiendo nuevas palabras',
  };

  private refreshInterval: any;

  constructor(
    private router: Router,
    private usuariosService: UsuariosService,
    private palabrasService: PalabrasService,
    private exploredWordsService: ExploredWordsService,
    private statsService: StatsService,
    private categoriasService: CategoriasService
  ) {}

  ngOnInit(): void {
    this.usuariosService.getAuthenticatedUser().subscribe({
      next: (resp) => {
        const user = resp.usuario;

        // --- GUIADO ---
        this.userLevel = user.currentLevel || 1;
        this.guidedStats.progress = Math.floor(((user.currentWordIndex + 1) / this.maxWords) * 100);
        this.guidedStats.wordsLearned = user.currentWordIndex + 1;
        this.guidedStats.level = user.nivel || 1;
        this.guidedStats.lastWordLearned = user.lastWordLearned || 'Error';
        this.guidedStats.totalWordsInLevel = this.maxWords;

        // --- LIBRE ---
        const initialExploredCount = user.exploredFreeWords ? user.exploredFreeWords.length : 0;
        this.exploredWordsService.setExploredCount(initialExploredCount);

        // Verifica si el usuario es nuevo en modo guiado
        this.isNewUserInGuidedMode = user.currentWordIndex === undefined || user.currentWordIndex < 0;
        if (this.isNewUserInGuidedMode) {
          this.animateProgress();
        } else {
          this.progressPercent = Math.floor(((user.currentWordIndex + 1) / this.maxWords) * 100);
        }

        this.userLevel = user.nivel || 1;
        this.lastWordLearned = user.lastWordLearned || 'Error';

        // Suscribirse a cambios en exploredCount
        this.exploredWordsService.exploredCount$.subscribe((count) => {
          this.exploredCount = count;
        });

        // Obtener la categoría más explorada
        this.usuariosService.getCategoriaMasExplorada(user.uid).subscribe({
          next: (respCat) => {
            if (respCat.ok && respCat.categoriaMasExplorada) {
              this.mostExploredCategoryName = respCat.categoriaMasExplorada.nombre;
              this.mostExploredCategoryCount = respCat.categoriaMasExplorada.count;
            } else {
              console.log('Ninguna categoría explorada aún');
            }
          },
          error: (err) => {
            console.error('Error obteniendo la categoría más explorada:', err);
          }
        });

        this.startRefreshTiempoLibre(user.uid);
      },
      error: (err) => {
        console.error('Error obteniendo usuario:', err);
        this.exploredWordsService.exploredCount$.subscribe((count) => {
          this.exploredCount = count;
        });
      },
    });

    this.palabrasService.obtenerPalabras().subscribe({
      next: (allPalabras) => {
        this.totalWords = allPalabras.length;
      },
      error: (err) => {
        console.error('Error obteniendo total de palabras:', err);
      },
    });

    this.categoriasService.obtenerCategorias().subscribe({
      next: (data) => {
        const categorias = data;
        if (categorias.length > 0) {
          const randomIndex = Math.floor(Math.random() * categorias.length);
          this.categoriaSugerida = categorias[randomIndex];
        }
      },
      error: (err) => {
        console.error('Error al obtener categorías para sugerencia:', err);
      }
    });
  }

  startRefreshTiempoLibre(userId: string): void {
    this.refreshTiempoLibre(userId);
    this.refreshInterval = setInterval(() => {
      this.refreshTiempoLibre(userId);
    }, 10000);
  }

  refreshTiempoLibre(userId: string): void {
    this.statsService.getTiempoTotalLibre(userId).subscribe({
      next: (resp) => {
        if (resp.ok) {
          this.tiempoLibreMs = resp.totalDurationMs;
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

  getProgressColor(progress: number): string {
    if (progress < 40) {
      return 'bg-danger';
    } else if (progress < 70) {
      return 'bg-warning';
    } else {
      return 'bg-success';
    }
  }

  animateProgress() {
    const stages = [
      { percent: 0, color: 'bg-transparent' },
      { percent: 33, color: 'bg-danger' },
      { percent: 66, color: 'bg-warning' },
      { percent: 100, color: 'bg-success' },
      { percent: 66, color: 'bg-warning' },
      { percent: 33, color: 'bg-danger' },
      { percent: 0, color: 'bg-transparent' },
    ];

    let index = 0;

    const updateProgress = () => {
      this.animatedProgress = stages[index].percent;
      this.animatedProgressColor = stages[index].color;

      index = (index + 1) % stages.length;

      setTimeout(updateProgress, 1000);
    };

    updateProgress();
  }

  navigateToMode(route: string) {
    this.router.navigate([route]);
  }

  navigateTo(destination: string) {
    if (destination === 'admin') {
      this.router.navigate(['/admin']);
    } else if (destination === 'perfil') {
      this.router.navigate(['/perfil']);
    }
  }

  calculateTimeSpent(startTime: number): string {
    if (!startTime) return '0 mins';
    const currentTime = Date.now();
    const diffInMillis = currentTime - startTime;
    const diffInMinutes = Math.floor(diffInMillis / 60000);
    return `${diffInMinutes} mins`;
  }
}
