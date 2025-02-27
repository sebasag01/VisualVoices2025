import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { CategoriasService } from '../services/categorias.service';
import { CanvasComponent } from '../canvas/canvas.component';
import { AnimacionService } from '../services/animacion.service'; // Importa el servicio
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { CardComponent } from "../card/card.component";
import { PalabrasService } from '../services/palabras.service';
import { UsuariosService } from '../services/usuarios.service';
import { StatsService } from '../services/stats.service';
import { ExploredWordsService } from '../services/explored_word.service'; 

import introJs from 'intro.js';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, CanvasComponent, CardComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  
  // ----- PROPIEDADES DE MODO GUIADO -----
  words: any[] = [];          // Lista dinámica de palabras
  currentIndex = 0;           // Índice actual de la palabra
  maxWords = 3;               // Límite de palabras a mostrar
  nivelActual = 1;            // Nivel actual
  availableLevels = [1, 2];   // Niveles disponibles
  userId: string = '';        // ID del usuario en BD
  showWelcome = true;         // Mostrar pant. bienvenida
  showChooseLevel = false;    // Mostrar pantalla de elegir nivel
  
  //Estadisticas
  currentStatsId: string | null = null;

  categorias: any[] = [];
  palabras: any[] = [];
  currentCategoryId: string | null = null;
  currentAnimationUrls: string[] = [];
  modo: string = 'libre'; // Nuevo: Valor predeterminado
  Math: any;

  @ViewChild('videoElement', { static: false }) videoElement!: ElementRef;

  showWebcam = false; // Para controlar si estamos mostrando la cámara


  constructor(
    private router: Router,
    private categoriasService: CategoriasService,
    private animacionService: AnimacionService,
    private palabrasService: PalabrasService,
    private usuariosService: UsuariosService,
    private statsService: StatsService,
    private exploredWordsService: ExploredWordsService,


  ) {}

  ngOnInit(): void {
    this.cargarCategorias();
    this.usuariosService.getAuthenticatedUser().subscribe({
      next: (resp) => {
        this.userId = resp.usuario.uid || resp.usuario._id;
        this.nivelActual = resp.usuario.currentLevel || 1;
        this.currentIndex = resp.usuario.currentWordIndex || 0;
        // Cargar palabras de ese nivel
        this.cargarPalabrasPorNivel(this.nivelActual);
      },
      error: (err) => {
        console.error('Error obteniendo usuario autenticado:', err);
        // fallback: nivel 1
        this.nivelActual = 1;
        this.currentIndex = 0;
        this.cargarPalabrasPorNivel(1);
      },
    });
    this.usuariosService.getAuthenticatedUser().subscribe({
      next: (resp) => {
        this.userId = resp.usuario.uid || resp.usuario._id;
        this.nivelActual = resp.usuario.currentLevel || 1;
        this.currentIndex = resp.usuario.currentWordIndex || 0;
        // Cargar palabras de ese nivel
        this.cargarPalabrasPorNivel(this.nivelActual);
      },
      error: (err) => {
        console.error('Error obteniendo usuario autenticado:', err);
        // fallback: nivel 1
        this.nivelActual = 1;
        this.currentIndex = 0;
        this.cargarPalabrasPorNivel(1);
      },
    });
  }

  // Nuevo: Cambiar modo según selector
  cambiarModo(event: any): void {
    this.modo = event.target.value;
    console.log('Modo seleccionado:', this.modo);
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
        (animacion: any) => `${environment.apiUrl}/gltf/animaciones/${animacion.filename}`
      );

      this.animacionService.cargarAnimaciones(animacionesUrls, true);
    } else {
      console.warn('No hay animaciones asociadas a esta palabra.');
    }

    this.usuariosService.explorarPalabraLibre(this.userId, palabra._id).subscribe({
      next: (resp) => {
        console.log('Palabra explorada. Lleva ', resp.totalExploradas, ' en total');

        // 3) Actualizar BehaviorSubject
        //   Con el número que te da el backend (totalExploradas):
        this.exploredWordsService.setExploredCount(resp.totalExploradas);
      },
      error: (err) => {
        console.error('Error al marcar como explorada:', err);
      }
    });
  }

  // -----------------------------------------
  // MÉTODOS QUE VIENEN DE MODO GUIADO
  // -----------------------------------------
  
  // 1. Cargar palabras por nivel
  cargarPalabrasPorNivel(nivel: number): void {
    this.palabrasService.obtenerPalabrasPorNivel(nivel).subscribe({
      next: (data) => {
        // Guardamos las palabras en `words` y, si quieres, puedes
        // truncarlas a `this.maxWords`.
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
    // Cargar palabras del nivel
    this.cargarPalabrasPorNivel(this.nivelActual);

    // Iniciar stats para este nivel
    // Primero, si ya teníamos un statsId abierto, lo cerramos
    if (this.currentStatsId) {
      this.statsService.endLevel(this.currentStatsId).subscribe({
        next: () => console.log('Stats anterior cerrado'),
        error: (err) => console.error('Error cerrando stats anterior', err),
      });
    }

    // Ahora iniciamos la sesión para este nivel
    this.statsService.startLevel(this.userId, this.nivelActual).subscribe({
      next: (resp) => {
        this.currentStatsId = resp.statsId;
        console.log('Stats iniciado, ID:', this.currentStatsId);
      },
      error: (err) => console.error('Error iniciando stats:', err)
    });
  }

  // 3. Empezar desde la primera
  empezarDesdePrimera(): void {
    this.showWelcome = false;
    this.currentIndex = 0;

    // Guardar en BD
    this.usuariosService.updateUserWordIndex(this.userId, 0).subscribe({
      next: () => console.log('Reinicio a la primera palabra'),
      error: (err: any) => console.error('Error reiniciando índice:', err)
    });

    this.cargarPalabrasPorNivel(this.nivelActual);
  }

  // 4. Getters de palabra y explicación actual
  get currentWord() {
    return this.words[this.currentIndex]?.palabra || 'Cargando...';
  }

  get currentExplanation() {
    return this.words[this.currentIndex]?.explicacion || 'Sin explicación disponible';
  }

  // 5. Al hacer clic en la palabra → reproducir animación
  handleWordClick() {
    const currentWord = this.words[this.currentIndex];
    console.log('Palabra clickeada:', currentWord);

    if (currentWord && currentWord.animaciones?.length > 0) {
      const animacionesUrls = currentWord.animaciones.map(
        (animacion: any) => `${environment.apiUrl}/gltf/animaciones/${animacion.filename}`
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
      this.usuariosService.updateUserWordIndex(this.userId, this.currentIndex).subscribe({
        next: (resp: any) => {
          console.log('Índice actualizado en BD:', resp.usuario?.currentWordIndex);
        },
        error: (err: any) => console.error('Error actualizando índice:', err)
      });
    }
  }

  // 8. Navegar a la siguiente palabra
  nextWord() {
    if (this.currentIndex < this.words.length - 1) {
      this.currentIndex++;
      this.usuariosService.updateUserWordIndex(this.userId, this.currentIndex).subscribe({
        next: (resp: any) => {
          console.log('Índice actualizado en BD:', resp.usuario?.currentWordIndex);
        },
        error: (err: any) => console.error('Error actualizando índice:', err)
      });
    }
  }

  // 9. Saber si estamos en la última palabra
  isLastWord(): boolean {
    return this.currentIndex === this.words.length - 1;
  }

  // 10. Avanzar de nivel
  advanceLevel() {
    const newLevel = this.nivelActual + 1;
    
      // 1) Cerrar la sesión de nivel actual
      if (this.currentStatsId) {
        this.statsService.endLevel(this.currentStatsId).subscribe({
          next: (resp) => console.log('Sesión de nivel cerrada. Duración:', resp.durationMs),
          error: (err) => console.error('Error al cerrar sesión de nivel:', err)
        });
        // Limpias la variable
        this.currentStatsId = null;
      }
    
      // 2) Actualizar nivel en la BD de usuarios
      this.usuariosService.updateUserLevel(this.userId, newLevel).subscribe({
      next: (resp) => {
        console.log('Nivel actualizado en el servidor:', resp.usuario.currentLevel);
        this.nivelActual = resp.usuario.currentLevel;

        // Reiniciamos índice a 0
        this.currentIndex = 0;
        this.usuariosService.updateUserWordIndex(this.userId, 0).subscribe({
          next: () => console.log('Índice reseteado a 0'),
          error: (err) => console.error('Error reseteando índice:', err)
        });

        // Mostramos pantalla de bienvenida, para que el usuario elija
        this.showWelcome = true;
        this.showChooseLevel = false;

        // Cargar las nuevas palabras ...
        this.cargarPalabrasPorNivel(this.nivelActual);

        // 3) Iniciar una nueva sesión de stats para el nuevo nivel (opcional si quieres rastrear)
        this.statsService.startLevel(this.userId, this.nivelActual).subscribe({
        next: (resp2) => {
          this.currentStatsId = resp2.statsId;
          console.log('Nueva sesión para el nivel actual:', this.currentStatsId);
        },
          error: (err) => console.error('Error iniciando nueva sesión de stats:', err)
        });
      },
      error: (err) => {
        console.error('Error al actualizar nivel:', err);
      }
    });
  }

  // 11. Elegir nivel manualmente
  openChooseLevel(): void {
    this.showChooseLevel = true;
  }

  onLevelSelected(level: number) {
    // Actualiza en BD
    this.usuariosService.updateUserLevel(this.userId, level).subscribe({
      next: (resp) => {
        console.log('Nivel actualizado en el servidor:', resp.usuario.currentLevel);
        this.nivelActual = resp.usuario.currentLevel;
      }
    });

    // Reinicia índice
    this.currentIndex = 0;
    this.usuariosService.updateUserWordIndex(this.userId, 0).subscribe({
      next: () => console.log('Reinicio a la primera palabra'),
      error: (err) => console.error('Error reiniciando índice:', err)
    });

    // Cargar palabras
    this.cargarPalabrasPorNivel(this.nivelActual);

    // Cerrar bienvenidas
    this.showWelcome = false;
    this.showChooseLevel = false;
  }

   //Obtener porcentaje de progeso
   get progressPercent(): number {
    if (!this.words || this.words.length === 0) return 0;
  
    // (currentIndex + 1) para que la primera palabra cuente como 1/3 en lugar de 0/3
    const progreso = ((this.currentIndex + 1) / this.words.length) * 100;
  
    // Redondea si quieres
    return Math.floor(progreso);
  }

  iniciarTutorial() {
    const intro = introJs();
    intro.setOptions({
      steps: [
        {
          // Resalta el selector de modo
          element: '#mode-selector',
          intro: 'Aquí puedes elegir el modo: Libre, Guiado o Examen.',
          position: 'right'
        },
        {
          element: '#modo-libre-container',
          intro: 'En Modo Libre verás categorías y palabras para animar el avatar.',
          position: 'top'
        },
        {
          // Resalta la zona del avatar
          element: '#avatar-element',
          intro: 'Este es tu avatar 3D. ¡Puedes interactuar con él! Con la rueda del raton puedes hacer zoom, con el click izquierdo rotarlo y con el derecho moverlo',
          position: 'left'
        }
        
      ],
      showProgress: true,
      showBullets: false,
      nextLabel: 'Siguiente',
      prevLabel: 'Anterior',
      skipLabel: 'Saltar',
      doneLabel: 'Finalizar'
    });

    intro.start();
  }

  toggleWebcam() {
    if (!this.showWebcam) {
      // Activar la cámara
      this.startWebcam();
    } else {
      // Desactivar la cámara
      this.stopWebcam();
    }
    // Cambiamos el estado
    this.showWebcam = !this.showWebcam;
  }

  startWebcam() {
    // Pedir acceso a la cámara
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        const video: HTMLVideoElement = this.videoElement.nativeElement;
        video.srcObject = stream;
        video.play();
      })
      .catch((err) => {
        console.error('Error accediendo a la cámara: ', err);
      });
  }

  stopWebcam() {
    const video: HTMLVideoElement = this.videoElement.nativeElement;
    const stream = video.srcObject as MediaStream;
    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
    }
    video.srcObject = null;
  }


}
