import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CanvasComponent } from '../canvas/canvas.component';
import { UsuariosService } from '../services/usuarios.service';
import { PalabrasService } from '../services/palabras.service';
import { ExploredWordsService } from '../services/explored_word.service';
import { HeaderComponent } from '../header/header.component';

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
    // Primero carga el usuario para obtener el valor inicial
    this.usuariosService.getAuthenticatedUser().subscribe({
      next: (resp) => {
        const user = resp.usuario;

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

        // Luego suscríbete a cambios futuros
        this.exploredWordsService.exploredCount$.subscribe((count) => {
          this.exploredCount = count;
          console.log('Modos - exploredCount actualizado a', count);
        });
      },
      error: (err) => {
        console.error('Error obteniendo usuario:', err);

        // Suscripción de respaldo en caso de error
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
