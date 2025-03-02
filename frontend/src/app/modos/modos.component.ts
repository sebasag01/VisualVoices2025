import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CanvasComponent } from '../canvas/canvas.component';
import { UsuariosService } from '../services/usuarios.service';
import { PalabrasService } from '../services/palabras.service';
import { ExploredWordsService } from '../services/explored_word.service';
import { HeaderComponent } from '../header/header.component';
import { StatsService } from '../services/stats.service';
import { CategoriasService } from '../services/categorias.service';

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
  categoriaSugerida: any = null;

  constructor(private router: Router,
    private usuariosService: UsuariosService,
    private palabrasService: PalabrasService,
    private exploredWordsService: ExploredWordsService,
    private statsService: StatsService,
    private categoriasService: CategoriasService) {};


  // MODO GUIADO

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
export class ModosComponent {
  modes = MODES;
  currentAnimationUrls: string[] = [];
  isNewUserInGuidedMode = true; // Suponemos que es nuevo hasta verificar
  animatedProgress = 0; // Comienza en 0
  wordsLearnedInLevel = 0; // Cantidad de palabras aprendidas en el nivel actual
  isNewUserInFreeMode = false;
  

  //ESTADO DEL USUARIO EN MODO GUIADO
  progressPercent = 0;
  maxWords = 3; // Límite de palabras en modo guiado
  userLevel = 1; // Nivel por defecto
  nextLevel: number | null = null; // Próximo nivel, si existe
  totalWordsInLevel = 1; // Total de palabras en la lección actual
  lastWordLearned: string = 'Adéntrate aprendiendo nuevas palabras';

  // MODO LIBRE
  totalWords = 0;       // total global de palabras (o si prefieres, total de una categoría)
  exploredCount = 0;    // cuántas ha explorado el usuario
  mostExploredCategoryName: string | null = null;
  mostExploredCategoryCount: number | null = null;
  tiempoLibreMs: number = 0;

  private refreshInterval: any;


  //angel
  //ESTADO DEL USUARIO EN MODO LIBRE
  totalWords = 0; // total global de palabras
  exploredCount = 0; // cuántas ha explorado el usuario
  animatedProgressColor = 'custom-purple'; // Color inicial en lila

  timeInvested: string = '0 mins'; // Tiempo invertido
  favoriteCategory: string = 'Categoría por determinar'; // Categoría favorita

  constructor(
    private router: Router,
    private usuariosService: UsuariosService,
    private palabrasService: PalabrasService,
    private exploredWordsService: ExploredWordsService
  ) {}

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

        // ---------------------- GUIADO ----------------------

        // Verifica si el usuario es nuevo en modo guiado
        this.isNewUserInGuidedMode =
          user.currentWordIndex === undefined || user.currentWordIndex < 0;

        if (this.isNewUserInGuidedMode) {
          this.animateProgress(); // Llamar la animación si es nuevo
        } else {
          this.progressPercent = Math.floor(
            ((user.currentWordIndex + 1) / this.maxWords) * 100
          );
        }

        this.userLevel = user.nivel || 1;

        // Última palabra aprendida
        this.lastWordLearned = user.lastWordLearned || 'Error';

        // 📌 Verificar si el usuario ya ha explorado el Modo Libre
      // this.isNewUserInFreeMode = !user.exploredFreeWords || user.exploredFreeWords.length === 0;

      // Obtener el tiempo invertido (por ejemplo, puede estar guardado en el backend)
      this.timeInvested = this.calculateTimeSpent(user.startTime);

      // Obtener la categoría favorita (puedes definir cómo obtenerla desde el backend)
      this.favoriteCategory = user.favoriteCategory || 'General';

    

        // -------------------------- LIBRE --------------------------
        // IMPORTANTE: Primero establece el contador desde los datos del usuario
        const initialExploredCount = user.exploredFreeWords
          ? user.exploredFreeWords.length
          : 0;
        console.log(
          'Inicializando exploredCount con valor:',
          initialExploredCount
        );
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
      },
    });


    // 2) Cargar el total de palabras
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
        // Guardamos todas las categorías
        const categorias = data;
        // Si hay al menos una categoría, elegimos una al azar
        if (categorias.length > 0) {
          const randomIndex = Math.floor(Math.random() * categorias.length);
          this.categoriaSugerida = categorias[randomIndex];
          console.log('Categoría sugerida:', this.categoriaSugerida.nombre);
        }
      },
      error: (err) => {
        console.error('Error al obtener categorías para sugerencia:', err);
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

  getProgressColor(progress: number): string {
    if (progress < 40) {
      return 'bg-danger'; // Rojo
    } else if (progress < 70) {
      return 'bg-warning'; // Amarillo
    } else {
      return 'bg-success'; // Verde
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
      { percent: 0, color: 'bg-transparent' }, //
    ];

    let index = 0;

    const updateProgress = () => {
      this.animatedProgress = stages[index].percent;
      this.animatedProgressColor = stages[index].color;

      index = (index + 1) % stages.length; // Mantener el ciclo infinito

      setTimeout(updateProgress, 1000); // Transición fluida cada 1s
    };

    updateProgress(); // Inicia la animación
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
    const diffInMillis = currentTime - startTime; // Diferencia en milisegundos
    const diffInMinutes = Math.floor(diffInMillis / 60000); // Convertir a minutos
    return `${diffInMinutes} mins`;
  }


}
