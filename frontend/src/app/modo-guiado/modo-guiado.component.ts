import { Component, OnInit, AfterViewInit  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { CardComponent } from '../card/card.component';
import { PalabrasService } from '../services/palabras.service'; // Importa el servicio
import { CanvasComponent } from '../canvas/canvas.component';
import { AnimacionService } from '../services/animacion.service'; // Importa el servicio
import { environment } from '../../environments/environment';
import { UsuariosService } from '../services/usuarios.service';
import introJs from 'intro.js';

@Component({
  selector: 'app-modo-guiado',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, CardComponent,CanvasComponent],
  templateUrl: './modo-guiado.component.html',
  styleUrls: ['./modo-guiado.component.css'],
})
export class ModoGuiadoComponent implements OnInit {
  words: any[] = []; // Lista dinámica de palabras
  currentIndex = 0; // Índice actual de la palabra
  maxWords = 3; // Limitar las palabras mostradas (opcional)
  nivelActual = 1;
  availableLevels = [1, 2];

  userId: string = '';


  constructor(private palabrasService: PalabrasService,private animacionService: AnimacionService, private usuariosService: UsuariosService) {}
  
  showWelcome = true; // Al principio, mostramos la “pantalla de bienvenida”
  showChooseLevel = false; // Indica si estamos en la pantalla de “Elige nivel”

  ngOnInit(): void {
    // Al cargar el modo guiado, primero obtenemos el usuario
    this.usuariosService.getAuthenticatedUser().subscribe({
      next: (resp) => {
        this.userId = resp.usuario.uid || resp.usuario._id;
        // resp.usuario tienes la info
        this.nivelActual = resp.usuario.currentLevel || 1;
        this.currentIndex = resp.usuario.currentWordIndex || 0;

        // Cargar las palabras de ese nivel
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

  ngAfterViewInit(): void {
    // Aquí ya tenemos los elementos del DOM disponibles
    // Llamamos a nuestro método que inicia el tutorial si procede
    //this.mostrarTutorialSiEsNuevo();
  }

  public iniciarTutorial(): void {
    const intro = introJs();
  
    intro.setOptions({
      steps: [
        {
          element: '#modos-container',
          intro: 'En esta zona encuentras los tres modos principales.',
          position: 'bottom'
        },
        {
          element: '#modo-guiado-button',
          intro: 'Este es el Modo Guiado, donde te acompañamos paso a paso.',
          position: 'bottom'
        },
        {
          element: '#modo-libre-button',
          intro: 'Este es el Modo Libre, para explorar sin restricciones.',
          position: 'bottom'
        },
        {
          element: '#modo-examen-button',
          intro: 'Este es el Modo Examen, para evaluar tus conocimientos.',
          position: 'bottom'
        },
        {
          element: '#avatar-element',
          intro: 'Aquí tienes tu avatar 3D. ¡Interactúa con él para ver animaciones!',
          position: 'right'
        },
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
  
  
  

  private mostrarTutorialSiEsNuevo(): void {
    // 1. Verificar si el usuario ya hizo el tutorial (puedes revisarlo en BD, localStorage, etc.)
    //    Supongamos que guardas en localStorage un flag “tutorialDone”:
    const tutorialHecho = localStorage.getItem('tutorialDone');

    if (!tutorialHecho) {
      // 2. Configurar Intro.js
      const intro = introJs();
      intro.setOptions({
        steps: [
          {
            element: '#modo-guiado-button',
            intro: 'Este es el Modo Guiado, donde te acompañamos paso a paso.',
            position: 'bottom'
          },
          {
            element: '#modo-libre-button',
            intro: 'Este es el Modo Libre, donde navegas libremente.',
            position: 'bottom'
          },
          {
            element: '#modo-examen-button',
            intro: 'Este es el Modo Examen, para evaluar tus conocimientos.',
            position: 'bottom'
          },
          {
            element: '#avatar-element',
            intro: 'Aquí ves tu avatar 3D. Interactúa con él para animaciones y más.',
            position: 'right'
          },
        ],
        showProgress: true,
        showBullets: true,
        // otras opciones de Intro.js...
      });

      // 3. Iniciar el tutorial
      intro.start();

      // 4. Cuando finalice, marcamos que ya se completó
      intro.oncomplete(() => {
        localStorage.setItem('tutorialDone', 'true');
      });
      // (Opcional) si quieres marcarlo también si cierran a medias
      intro.onexit(() => {
        localStorage.setItem('tutorialDone', 'true');
      });
    }
  }
  
  // Método para cargar palabras desde el servicio
  cargarPalabrasPorNivel(nivel: number): void {
    this.palabrasService.obtenerPalabrasPorNivel(nivel).subscribe({
      next: (data) => {
        // Si solo quieres 3 palabras o 5 de ese nivel, puedes recortar
        this.words = data.slice(0, this.maxWords);
        console.log('Palabras del nivel', nivel, this.words);
      },
      error: (error) => {
        console.error('Error al cargar las palabras:', error);
      },
    });
  }
  // Botón “Continuar” → (futuro) retomar la palabra por la que iba.
  // De momento, simplemente cierra la pantalla de bienvenida y carga.
  continuar(): void {
    this.showWelcome = false;
    this.cargarPalabrasPorNivel(this.nivelActual);
  }

  empezarDesdePrimera(): void {
    this.showWelcome = false;
    this.currentIndex = 0;
    this.usuariosService.updateUserWordIndex(this.userId, 0).subscribe({
      next: (resp: any) => console.log('Reinicio a la primera palabra'),
      error: (err: any) => console.error('Error reiniciando índice:', err)
    });
  
    this.cargarPalabrasPorNivel(this.nivelActual);
  }
  // Propiedad para obtener la palabra actual
  // Propiedad para obtener la palabra actual
  get currentWord() {
    return this.words[this.currentIndex]?.palabra || 'Cargando...';
  }

  get currentExplanation() {
    return this.words[this.currentIndex]?.explicacion || 'Sin explicación disponible';
  }

  // Evento para el clic del botón de palabra
  handleWordClick() {
    const currentWord = this.words[this.currentIndex];
    console.log('Palabra clickeada:', currentWord); // Solo un log para depuración
    
    if (currentWord && currentWord.animaciones && currentWord.animaciones.length > 0) {
      const animacionesUrls = currentWord.animaciones.map(
        (animacion: any) => `${environment.apiUrl}/gltf/animaciones/${animacion.filename}`
      );
      console.log('Cargando animaciones:', animacionesUrls); // Log para depuración
      this.animacionService.cargarAnimaciones(animacionesUrls, true); // Marcamos como manual = true
    } else {
      console.warn('No hay animaciones disponibles para esta palabra');
    }
  }

  // Evento para repetir la acción
  handleRepeatClick() {
    this.handleWordClick();
    console.log(`Repetir acción para: ${this.currentWord}`);
  }

  // Cambiar a la palabra anterior
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
  

  // Cambiar a la siguiente palabra
  nextWord() {
    if (this.currentIndex < this.words.length - 1) {
      this.currentIndex++;
  
      // Actualizar en la BD
      this.usuariosService.updateUserWordIndex(this.userId, this.currentIndex).subscribe({
        next: (resp: any) => {
          console.log('Índice actualizado en BD:', resp.usuario?.currentWordIndex);
        },
        error: (err: any) => console.error('Error actualizando índice:', err)
      });
    }
  }
  

  isLastWord(): boolean {
    return this.currentIndex === this.words.length - 1;
  }

  advanceLevel() {
    const newLevel = this.nivelActual + 1;
  
    this.usuariosService.updateUserLevel(this.userId, newLevel).subscribe({
      next: (resp) => {
        console.log('Nivel actualizado en el servidor:', resp.usuario.currentLevel);
  
        // 1. Actualizamos nuestro `nivelActual`
        this.nivelActual = resp.usuario.currentLevel;
  
        // 2. Resetear el índice a 0
        this.currentIndex = 0;
        this.usuariosService.updateUserWordIndex(this.userId, 0).subscribe({
          next: () => console.log('Índice reseteado a 0'),
          error: (err) => console.error('Error reseteando índice:', err)
        });
  
        // 3. Configurar la "pantalla de bienvenida" para que muestre "Bienvenido al nivel X"
        this.showWelcome = true;
        this.showChooseLevel = false; // Por si estaba abierto el selector de nivel
  
        // 4. (Opcional) cargar las palabras ya para tenerlas en `this.words`,
        // pero el usuario no las ve hasta que pulse "Continuar"
        this.cargarPalabrasPorNivel(this.nivelActual);
      },
      error: (err) => {
        console.error('Error al actualizar nivel:', err);
      }
    });
  }
  
  

  openChooseLevel(): void {
    // El usuario ha pulsado el botón "Elegir nivel"
    this.showChooseLevel = true;
  }
  
  // Cuando el usuario hace click en un nivel
  onLevelSelected(level: number) {
    // 1. Actualizamos nivelActual
    this.nivelActual = level;
    this.usuariosService.updateUserLevel(this.userId, level).subscribe({
      next: (resp) => {
        console.log('Nivel actualizado en el servidor:', resp.usuario.currentLevel);
  
        // 1. Actualizamos nuestro `nivelActual`
        this.nivelActual = resp.usuario.currentLevel;
      }
    });
    // 2. Ponemos currentIndex = 0 (o el que quieras) y actualizamos en BD
    this.currentIndex = 0;

    this.usuariosService.updateUserWordIndex(this.userId, 0).subscribe({
      next: (resp: any) => {
        console.log('Reinicio a la primera palabra');
      },
      error: (err: any) => {
        console.error('Error reiniciando índice:', err);
      }
    });  

    // 3. Cargamos las palabras
    this.cargarPalabrasPorNivel(this.nivelActual);
  
    // 4. Cerramos la bienvenida y la vista de elegir nivel
    this.showWelcome = false;
    this.showChooseLevel = false;
  }

}
