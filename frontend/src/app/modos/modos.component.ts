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
import introJs from 'intro.js';

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
  userId: string = '';

  modes = MODES;
  currentAnimationUrls: string[] = [];

  // Modo GUIADO
  isNewUserInGuidedMode = true;
  animatedProgress = 0;
  progressPercent = 0;
  maxWords = 4;
  userLevel = 1;
  nextLevel: number | null = null;
  lastWordLearned: string = 'Adántrate aprendiendo nuevas palabras';

  // Modo LIBRE
  totalWords = 0;
  exploredCount = 0;
  animatedProgressColor = 'custom-purple';
  timeInvested: string = '0 mins';
  favoriteCategory: string = 'Categoría por determinar';

  // Propiedades adicionales para LIBRE
  mostExploredCategoryName: string | null = null;
  mostExploredCategoryCount: number | null = null;
  tiempoLibreMs: number = 0;
  categoriaSugerida: any = null;
  currentStatsId: string | null = null;
  //tutorial
  private introInstance: any = null;
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
    // Obtener datos del usuario
    this.usuariosService.getAuthenticatedUser().subscribe({
      next: (resp) => {
        const user = resp.usuario;
        console.log('DEBUG: Usuario completo:', user);
        console.log('DEBUG: isNewUser value:', user.isNewUser);
        console.log('DEBUG: isNewUser type:', typeof user.isNewUser);
        this.userId = user.uid; // Asignar el ID del usuario

        if (user.isnewuser) {
          // 1) Lanza el tutorial
          console.log('isNewUser = true, mostrando tutorial...');
          this.iniciarTutorialParaNuevoUsuario();

          // 2) Marca en la BD que ya no es nuevo (para no repetir)
          this.usuariosService.updateFirstTime(user.uid, false).subscribe({
            next: () => console.log('Marcado como isNewUser=false'),
            error: (err) => console.error('Error actualizando isNewUser:', err),
          });
        } else {
          console.log('isNewUser = false, no muestro tutorial');
        }

        // Modo GUIADO
        this.isNewUserInGuidedMode =
          user.currentWordIndex === undefined || user.currentWordIndex < 0;

        if (this.isNewUserInGuidedMode) {
          this.animateProgress();
        } else {
          this.progressPercent = Math.floor(
            ((user.currentWordIndex + 1) / this.maxWords) * 100
          );
        }
        this.userLevel = user.currentLevel || 1;
        this.nextLevel = user.nextLevel || null;

        // Aquí lees la última palabra directamente del usuario
        // y la muestras en el front sin necesidad de calcular nada:
        if (user.lastWordLearned) {
          this.lastWordLearned = user.lastWordLearned;
        } else {
          this.lastWordLearned = 'Aún no has aprendido ninguna palabra';
        }

        // Calcular tiempo invertido (por ejemplo, para guiado)
        this.timeInvested = this.calculateTimeSpent(user.startTime);

        // --- Modo LIBRE ---
        const initialExploredCount = user.exploredFreeWords
          ? user.exploredFreeWords.length
          : 0;
        this.exploredWordsService.setExploredCount(initialExploredCount);
        this.exploredWordsService.exploredCount$.subscribe((count) => {
          this.exploredCount = count;
          console.log('Modos - exploredCount actualizado a', count);
        });

        // Obtener la categoría más explorada
        this.usuariosService.getCategoriaMasExplorada(user.uid).subscribe({
          next: (respCat) => {
            if (respCat.ok && respCat.categoriaMasExplorada) {
              this.mostExploredCategoryName =
                respCat.categoriaMasExplorada.nombre;
              this.mostExploredCategoryCount =
                respCat.categoriaMasExplorada.count;
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
          },
        });

        // Iniciar la actualización periódica del tiempo total en modo libre
        this.startRefreshTiempoLibre(user.uid);
      },
      error: (err) => {
        console.error('Error obteniendo usuario:', err);
        this.exploredWordsService.exploredCount$.subscribe((count) => {
          this.exploredCount = count;
          console.log('Modos - exploredCount actualizado a', count);
        });
      },
    });

    // Cargar el total de palabras
    this.palabrasService.obtenerPalabras().subscribe({
      next: (allPalabras) => {
        this.totalWords = allPalabras.length;
      },
      error: (err) => {
        console.error('Error obteniendo total de palabras:', err);
      },
    });

    // Obtener categoría sugerida para el modo libre
    this.categoriasService.obtenerCategorias().subscribe({
      next: (data) => {
        if (data.length > 0) {
          const randomIndex = Math.floor(Math.random() * data.length);
          this.categoriaSugerida = data[randomIndex];
          console.log('Categoría sugerida:', this.categoriaSugerida.nombre);
        }
      },
      error: (err) => {
        console.error('Error al obtener categorías para sugerencia:', err);
      },
    });
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

  calculateTimeSpent(startTime: number): string {
    if (!startTime) return '0 mins';
    const currentTime = Date.now();
    const diffInMillis = currentTime - startTime;
    const diffInMinutes = Math.floor(diffInMillis / 60000);
    return `${diffInMinutes} mins`;
  }

  startRefreshTiempoLibre(userId: string): void {
    this.refreshTiempoLibre(userId);
    this.refreshInterval = setInterval(() => {
      console.log('Refrescando tiempo total en modo libre...');
      this.refreshTiempoLibre(userId);
    }, 60000);
  }

  refreshTiempoLibre(userId: string): void {
    this.statsService.getTiempoTotalLibre(userId).subscribe({
      next: (resp) => {
        if (resp.ok) {
          this.tiempoLibreMs = resp.totalDurationMs;
          console.log(
            'Actualización - Tiempo total Modo Libre (ms):',
            this.tiempoLibreMs
          );
        } else {
          console.log('Respuesta ok false en getTiempoTotalLibre:', resp.msg);
        }
      },
      error: (err) => {
        console.error('Error al obtener tiempo total libre:', err);
      },
    });
  }

  navigateToMode(route: string) {
    // Cerrar el tutorial de intro.js si está activo
    const introjs = document.querySelector('.introjs-overlay');
    if (introjs) {
      // Forzar la salida del tutorial
      const exitEvent = new Event('click');
      const doneButton = document.querySelector('.introjs-donebutton');
      if (doneButton) {
        doneButton.dispatchEvent(exitEvent);
      }
    }

    // Navegar a la ruta del modo
    this.router.navigate([route]);
  }

  navigateTo(destination: string) {
    if (destination === 'admin') {
      this.router.navigate(['/admin']);
    } else if (destination === 'perfil') {
      this.router.navigate(['/perfil']);
    }
  }

  ngOnDestroy(): void {
    if (this.currentStatsId) {
      this.statsService.endMode(this.currentStatsId).subscribe({
        next: (resp) => {
          console.log(
            'Sesión de modo libre cerrada. Duración (ms):',
            resp.durationMs
          );
        },
        error: (err) =>
          console.error('Error al cerrar la sesión de modo libre:', err),
      });
    }
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  iniciarTutorialParaNuevoUsuario() {
    console.log('[DEBUG] Iniciando tutorial - userId:', this.userId);
    console.log('[DEBUG] Iniciando tutorial - userId:', this.userId);
    console.log(
      '[DEBUG] Verificando elementos DOM:',
      document.querySelector('.mode-selector-container'),
      document.querySelector('.modes-container')
    );

    const intro = introJs();
    this.introInstance = intro; // Guardar la instancia

    intro.setOptions({
      steps: [
        {
          // Mensaje inicial "Bienvenido a la web"
          title: '¡Bienvenido!',
          intro:
            'Ésta es la página principal desde donde podrás acceder a cada modo.',
        },
        {
          // Selecciona un elemento que represente "toda la página",
          // o si prefieres no resaltar nada, deja solo el texto.
          element: '.mode-selector-container',
          intro:
            'Esta sección te muestra la página principal, con tu avatar y los modos disponibles.',
          position: 'bottom',
        },
        {
          // Después, apuntas a la parte derecha donde están los 3 modos
          element: '.modes-container',
          intro:
            'Aquí tienes los 3 modos. ¡Te recomendamos empezar por "APRENDE" si es tu primera vez!',
          position: 'auto' as unknown as 'left' | 'right' | 'bottom' | 'top',
          highlightClass: 'custom-highlight', // Aplica la clase personalizada
        },
      ],
      showProgress: true,
      showBullets: false,
      skipLabel: 'Saltar',
      doneLabel: 'Hecho',
    });

    intro.oncomplete(() => {
      console.log(
        '[DEBUG] Tutorial completado, actualizando isNewUser a false...'
      );
      this.usuariosService.updateFirstTime(this.userId, false).subscribe({
        next: () => console.log('Marcado como isNewUser=false'),
        error: (err) => console.error('Error actualizando isNewUser:', err),
      });
    });

    // También puedes manejar onexit en caso de que el usuario cierre el tutorial
    intro.onexit(() => {
      console.log('[DEBUG] Tutorial salido, actualizando isNewUser a false...');
      this.usuariosService.updateFirstTime(this.userId, false).subscribe({
        next: () => console.log('Marcado como isNewUser=false'),
        error: (err) => console.error('Error actualizando isNewUser:', err),
      });
    });

    // Dar un breve delay para asegurarnos de que el DOM está renderizado
    setTimeout(() => {
      console.log('Iniciando tutorial...');
      intro.start();
    }, 1500);
  }

  logout(): void {
    console.log('[DEBUG] Cerrando sesión desde Modo Libre...');
    this.usuariosService.logout().subscribe({
      next: (response) => {
        console.log('[DEBUG] Respuesta del logout:', response);
        // Aquí puedes limpiar datos locales si lo necesitas
        // Por ejemplo, this.usuario = null; si lo tuvieras
        this.router.navigate(['/landing']);
      },
      error: (error) => {
        console.error('[ERROR] Error al cerrar sesión:', error);
        alert('Error al cerrar sesión.');
      },
    });
  }
}
