import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { CanvasComponent } from '../canvas/canvas.component';
import { CardComponent } from '../card/card.component';

import { Router } from '@angular/router';
import { AnimacionService } from '../services/animacion.service';
import { CategoriasService } from '../services/categorias.service';
import { PalabrasService } from '../services/palabras.service';
import { UsuariosService } from '../services/usuarios.service';

import { environment } from '../../environments/environment';
import { StatsService } from '../services/stats.service';
import { ExploredWordsService } from '../services/explored_word.service';

import introJs from 'intro.js';

@Component({
  selector: 'app-modo-guiado',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    // FooterComponent,
    CanvasComponent,
    CardComponent,
  ],
  templateUrl: './modo-guiado.component.html',
  styleUrls: ['./modo-guiado.component.css'],
})
export class ModoGuiadoComponent implements OnInit {
  // Propiedades específicas del modo guiado
  words: any[] = [];
  currentIndex = 0;
  maxWords = 4;
  nivelActual = 1;
  availableLevels = [1, 2, 3];

  // Usuario, estadisticas, etc.
  userId: string = '';
  currentStatsId: string | null = null; // ID para stats

  // Control de pantallas
  showWelcome = true;
  showChooseLevel = false;

  // Variables generales (opcionalmente se pueden quitar si no las usas aquí)
  categorias: any[] = [];
  palabras: any[] = [];
  currentCategoryId: string | null = null;
  currentAnimationUrls: string[] = [];
  modo: string = 'guiado';

  // Cámara
  @ViewChild('videoElement', { static: false }) videoElement!: ElementRef;
  showWebcam = false;

  constructor(
    private router: Router,
    private animacionService: AnimacionService,
    private categoriasService: CategoriasService,
    private palabrasService: PalabrasService,
    private usuariosService: UsuariosService,
    private statsService: StatsService,
    private exploredWordsService: ExploredWordsService
  ) {}

  ngOnInit(): void {
    // 1) Cargar categoría si lo necesitas en guiado (no siempre es necesario)
    this.cargarCategorias();

    // 2) Obtener usuario, nivelActual e índice actual
    this.usuariosService.getAuthenticatedUser().subscribe({
      next: (resp) => {
        this.userId = resp.usuario.uid || resp.usuario._id;
        this.nivelActual = resp.usuario.currentLevel || 1;
        this.currentIndex = resp.usuario.currentWordIndex || 0;

        // Cargar las palabras de este nivel
        this.cargarPalabrasPorNivel(this.nivelActual);
      },
      error: (err) => {
        console.error('Error obteniendo usuario autenticado:', err);
        // Fallback si no hay usuario
        this.nivelActual = 1;
        this.currentIndex = 0;
        this.cargarPalabrasPorNivel(1);
      },
    });
  }

  navigateTo(destination: string) {
    if (destination === 'perfil') {
      this.router.navigate(['/perfil']);
    }
  }

  // -----------------------------------------
  // Métodos específicos de Modo Guiado
  // -----------------------------------------

  cargarCategorias(): void {
    this.categoriasService.obtenerCategorias().subscribe({
      next: (data) => {
        this.categorias = data;
        if (this.categorias.length > 0) {
          this.selectCategory(this.categorias[0]._id);
        }
      },
      error: (error) => {
        console.error('Error al cargar las categorías:', error);
      },
    });
  }

  selectCategory(categoriaId: string): void {
    this.currentCategoryId = categoriaId;
    this.categoriasService.obtenerPalabrasPorCategoria(categoriaId).subscribe({
      next: (data) => {
        this.palabras = data;
      },
      error: (error) => {
        console.error('Error al cargar las palabras:', error);
      },
    });
  }

  seleccionarPalabra(palabra: any): void {
    if (palabra.animaciones && palabra.animaciones.length > 0) {
      const animacionesUrls = palabra.animaciones.map(
        (animacion: any) =>
          `${environment.apiUrl}/gltf/animaciones/${animacion.filename}`
      );

      this.animacionService.cargarAnimaciones(animacionesUrls, true);
    } else {
      console.warn('No hay animaciones asociadas a esta palabra.');
    }
  }

  // -----------------------------------------
  // MÉTODOS QUE VIENEN DE MODO GUIADO
  // -----------------------------------------

  // 1. Cargar palabras por nivel
  cargarPalabrasPorNivel(nivel: number): void {
    this.palabrasService.obtenerPalabrasPorNivel(nivel).subscribe({
      next: (data) => {
        this.words = data.slice(0, this.maxWords);
        console.log('Palabras del nivel', nivel, this.words);
      },
      error: (error) => {
        console.error('Error al cargar las palabras:', error);
      },
    });
  }

  // 2. Continuar donde iba
  continuar(): void {
    this.showWelcome = false;

    // Si quieres recargar las palabras para garantizar que no falten cambios
    this.cargarPalabrasPorNivel(this.nivelActual);

    // Cerrar stats anterior si existía
    if (this.currentStatsId) {
      this.statsService.endLevel(this.currentStatsId).subscribe({
        next: () => console.log('Stats anterior cerrado'),
        error: (err) => console.error('Error cerrando stats anterior', err),
      });
      this.currentStatsId = null;
    }

    // Iniciar nueva sesión de stats para este nivel
    this.statsService.startLevel(this.userId, this.nivelActual).subscribe({
      next: (resp) => {
        this.currentStatsId = resp.statsId;
        console.log('Stats iniciado, ID:', this.currentStatsId);
      },
      error: (err) => console.error('Error iniciando stats:', err),
    });
  }

  // 3. Empezar desde la primera
  empezarDesdePrimera(): void {
    this.showWelcome = false;
    this.currentIndex = 0;

    // Guardar el índice en BD
    this.usuariosService.updateUserWordIndex(this.userId, 0).subscribe({
      next: () => console.log('Reinicio a la primera palabra'),
      error: (err: any) => console.error('Error reiniciando índice:', err),
    });

    this.cargarPalabrasPorNivel(this.nivelActual);
  }

  // 4. Getters de palabra y explicación actual
  get currentWord() {
    return this.words[this.currentIndex]?.palabra || 'Cargando...';
  }

  get currentExplanation() {
    return (
      this.words[this.currentIndex]?.explicacion || 'Sin explicación disponible'
    );
  }

  // 5. Al hacer clic en la palabra → reproducir animación
  handleWordClick() {
    const currentWord = this.words[this.currentIndex];
    console.log('Palabra clickeada:', currentWord);

    if (currentWord && currentWord.animaciones?.length > 0) {
      const animacionesUrls = currentWord.animaciones.map(
        (animacion: any) =>
          `${environment.apiUrl}/gltf/animaciones/${animacion.filename}`
      );
      console.log('Cargando animaciones:', animacionesUrls);
      this.animacionService.cargarAnimaciones(animacionesUrls, true);
    } else {
      console.warn('No hay animaciones disponibles para esta palabra');
    }
  }

  // 6. Repetir la animación
  handleRepeatClick() {
    this.handleWordClick();
    console.log(`Repetir acción para: ${this.currentWord}`);
  }

  // 7. Navegar a la palabra anterior
  prevWord() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.usuariosService
        .updateUserWordIndex(this.userId, this.currentIndex)
        .subscribe({
          next: (resp: any) => {
            console.log(
              'Índice actualizado en BD:',
              resp.usuario?.currentWordIndex
            );
          },
          error: (err: any) => console.error('Error actualizando índice:', err),
        });
    }
  }

  // 8. Navegar a la siguiente palabra
  // 8. Navegar a la siguiente palabra
nextWord() {
  // Si NO estamos en la última palabra
  if (this.currentIndex < this.words.length - 1) {
    this.currentIndex++;
    // Actualizamos el índice en la BD
    this.usuariosService
        .updateUserWordIndex(this.userId, this.currentIndex)
        .subscribe({
        next: (resp: any) => {
          console.log(
              'Índice actualizado en BD:',
              resp.usuario?.currentWordIndex
            );
  
        // Actualizar lastWordLearned con la palabra que acabamos de “terminar”
        // O con la palabra en la que acabamos de entrar, según tu lógica.
        const lastLearned = this.words[this.currentIndex-1].palabra; 
        this.usuariosService
          .updateUserLastWordLearned(this.userId, lastLearned)
          .subscribe({
            next: () => console.log('Última palabra actualizada en el usuario'),
            error: (err: any) => console.error('Error actualizando última palabra:', err)
          });
      },
        error: (err: any) => console.error('Error actualizando índice:', err),
      });
  }
}


  // 9. Saber si estamos en la última palabra
  isLastWord(): boolean {
    return this.currentIndex === this.words.length - 1;
  }

  // 10. Avanzar de nivel
  advanceLevel() {
    // const ultimaPalabraDelNivel = this.words[this.words.length - 1].palabra;
    // const textoNivel = `Lección ${this.nivelActual}`;
    // const ultimaPalabraTexto = `${ultimaPalabraDelNivel} `;
    
    if (this.words.length > 0) {
      const ultimaPalabraDelNivel = this.words[this.words.length - 1].palabra;
      this.usuariosService.updateUserLastWordLearned(this.userId, ultimaPalabraDelNivel)
      .subscribe({
          next: () => console.log('Última palabra del nivel anterior guardada'),
          error: (err: any) => console.error('Error guardando la última palabra:', err)
        });
    }

    const newLevel = this.nivelActual + 1;

    // Cerrar sesión de stats del nivel actual si está activa
    if (this.currentStatsId) {
      this.statsService.endLevel(this.currentStatsId).subscribe({
        next: (resp) => {
          console.log('Sesión de nivel cerrada. Duración:', resp.durationMs);
        },
        error: (err) => console.error('Error al cerrar sesión de nivel:', err),
      });
      this.currentStatsId = null;
    }

    // Actualizar nivel en BD
    this.usuariosService.updateUserLevel(this.userId, newLevel).subscribe({
      next: (resp) => {
        console.log(
          'Nivel actualizado en el servidor:',
          resp.usuario.currentLevel
        );
        this.nivelActual = resp.usuario.currentLevel;

        // Resetear índice a 0
        this.currentIndex = 0;
        this.usuariosService.updateUserWordIndex(this.userId, 0).subscribe({
          next: () => console.log('Índice reseteado a 0'),
          error: (err) => console.error('Error reseteando índice:', err),
        });

        // Mostramos pantalla de bienvenida para que elija qué hacer
        this.showWelcome = true;
        this.showChooseLevel = false;

        // Cargamos las palabras del nuevo nivel
        // Cargar las nuevas palabras ...
        this.cargarPalabrasPorNivel(this.nivelActual);

        // Iniciar nueva sesión de stats para el nuevo nivel (opcional)
        this.statsService.startLevel(this.userId, this.nivelActual).subscribe({
          next: (resp2) => {
            this.currentStatsId = resp2.statsId;
            console.log(
              'Nueva sesión para el nivel actual:',
              this.currentStatsId
            );
          },
          error: (err) =>
            console.error('Error iniciando nueva sesión de stats:', err),
        });

        // 3) Iniciar una nueva sesión de stats para el nuevo nivel (opcional si quieres rastrear)
        this.statsService.startLevel(this.userId, this.nivelActual).subscribe({
          next: (resp2) => {
            this.currentStatsId = resp2.statsId;
            console.log(
              'Nueva sesión para el nivel actual:',
              this.currentStatsId
            );
          },
          error: (err) =>
            console.error('Error iniciando nueva sesión de stats:', err),
        });
      },
      error: (err) => {
        console.error('Error al actualizar nivel:', err);
      },
    });
  }

  // 11. Elegir nivel manualmente
  openChooseLevel(): void {
    this.showChooseLevel = true;
  }

  onLevelSelected(level: number) {
    // Actualizar nivel en BD
    this.usuariosService.updateUserLevel(this.userId, level).subscribe({
      next: (resp) => {
        console.log(
          'Nivel actualizado en el servidor:',
          resp.usuario.currentLevel
        );
        this.nivelActual = resp.usuario.currentLevel;
      },
      error: (err) => console.error('Error actualizando nivel:', err),
    });

    // Reiniciar índice
    this.currentIndex = 0;
    this.usuariosService.updateUserWordIndex(this.userId, 0).subscribe({
      next: () => console.log('Reinicio a la primera palabra'),
      error: (err) => console.error('Error reiniciando índice:', err),
    });

    // Cargar palabras del nuevo nivel
    this.cargarPalabrasPorNivel(this.nivelActual);

    // Cerrar welcome
    this.showWelcome = false;
    this.showChooseLevel = false;
  }

  // Getter opcional para el porcentaje de avance
  get progressPercent(): number {
    if (!this.words || this.words.length === 0) return 0;
    const progreso = ((this.currentIndex + 1) / this.words.length) * 100;
    return Math.floor(progreso);
  }

  // Tutorial
  iniciarTutorial() {
    const intro = introJs();
    intro.setOptions({
      steps: [
        {
          element: '#avatar-element',
          intro: 'Este es tu avatar 3D. ¡Puedes interactuar con él!',
          position: 'left',
        },
      ],
      showProgress: true,
      showBullets: false,
      nextLabel: 'Siguiente',
      prevLabel: 'Anterior',
      skipLabel: 'Saltar',
      doneLabel: 'Finalizar',
    });

    intro.start();
  }

  // ----------------------
  // Control de cámara
  // ----------------------
  toggleWebcam() {
    this.showWebcam = !this.showWebcam;

    // Esperar a que Angular actualice la vista antes de manipular el DOM
    setTimeout(() => {
      if (this.showWebcam) {
        this.startWebcam();
      } else {
        this.stopWebcam();
      }
    }, 0);
  }

  startWebcam() {
    // Verificar que el elemento existe
    if (!this.videoElement) {
      console.error('Elemento de video no encontrado');
      return;
    }

    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        const video: HTMLVideoElement = this.videoElement.nativeElement;
        video.srcObject = stream;
        video.play();
      })
      .catch((err) => {
        console.error('Error accediendo a la cámara: ', err);
        this.showWebcam = false; // Revertir estado si hay error
      });
  }

  stopWebcam() {
    // Verificar que el elemento existe
    if (!this.videoElement || !this.videoElement.nativeElement) {
      return;
    }

    const video: HTMLVideoElement = this.videoElement.nativeElement;
    const stream = video.srcObject as MediaStream;
    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
    }
    video.srcObject = null;
  }
  //cerrar sesion
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

  volverAModos(): void {
    this.router.navigate(['/modos']);
  }
}
