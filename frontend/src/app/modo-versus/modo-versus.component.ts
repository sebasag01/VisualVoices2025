import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { ExamenService } from '../services/examen.service';
import { UsuariosService } from '../services/usuarios.service';
import { AnimacionService } from '../services/animacion.service';

import { HeaderComponent } from '../header/header.component';
import { CanvasComponent } from '../canvas/canvas.component';

import { FormsModule } from '@angular/forms';
import { environment } from '../../environments/environment';
import confetti from 'canvas-confetti';


@Component({
  selector: 'app-modo-versus',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    CanvasComponent,
    FormsModule
  ],
  templateUrl: './modo-versus.component.html',
  styleUrls: ['./modo-versus.component.css']
})
export class ModoVersusComponent implements OnInit, OnDestroy {
  @ViewChild(CanvasComponent) canvasRef!: CanvasComponent;
  @ViewChild('videoElement', { static: false }) videoElement!: ElementRef;

  player1Name: string = '';
  player2Name: string = '';

  // Marcador para cada jugador: un array de 3 “slots” que pueden ser 'hit' (acierto), 'miss' (fallo) o 'empty'
  player1Score: string[] = ['empty', 'empty', 'empty'];
  player2Score: string[] = ['empty', 'empty', 'empty'];

  // Puntero al “slot” actual de cada jugador
  player1Index: number = 0;
  player2Index: number = 0;

  signerName: string = '';
  guesserName: string = '';

  uiState: 'nombres' | 'turnAnnounce' | 'playing' | 'finPartida' = 'nombres';
  ganador: string = '';

  usedWords: string[] = [];

  public currentWord: string = 'Cargando...';
  public showRecordedVideo: boolean = false;

  // Para el examen/pregunta
  questionId!: string;
  opciones: any[] = [];
  animaciones: any[] = [];
  resultado: string = '';
  cargandoPregunta: boolean = false;
  optionStatus: { [key: string]: 'correct' | 'incorrect' } = {};

  // Modo
  selectedTool: string = '';
  showWebcam: boolean = false;
  hasStarted: boolean = false; // Indica si se presionó "Empezar modo"

  // Grabación
  isRecording: boolean = false; // Indica si se está grabando
  videoStream!: MediaStream;
  recordedChunks: Blob[] = [];
  recordedVideoUrl: string = '';
  mediaRecorder!: MediaRecorder;
  currentTurnName: string = '';

  isLooping = false;

  sessionId!: string;    // Nueva: identificador de la “sesión de examen”



  private isSuddenDeath = false; 



  constructor(
    private examenService: ExamenService,
    private usuariosService: UsuariosService,
    private animacionService: AnimacionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Cargar la pregunta cuando el usuario inicie el modo
    // (en este ejemplo, se hace al pulsar un botón "Empezar")
  }

  ngOnDestroy(): void {
    // Limpiar cuando se sale
    if (this.isRecording) {
      this.terminarGrabacion();
    }
    if (this.showWebcam) {
      this.stopWebcam();
    }
  }


  onStartButton(): void {
    // Asegurarte que ambos tengan un nombre
    if (!this.player1Name) this.player1Name = 'Jugador1';
    if (!this.player2Name) this.player2Name = 'Jugador2';

    // Elegir quién FIRMA primero
    if (Math.random() < 0.5) {
      this.signerName = this.player1Name;
      this.guesserName = this.player2Name;
    } else {
      this.signerName = this.player2Name;
      this.guesserName = this.player1Name;
    }

    this.currentTurnName = this.signerName;

    // Pasamos a la pantalla "TurnAnnounce"
    this.uiState = 'turnAnnounce';

    this.iniciarModo();   // <<--- se ejecuta aquí

    // Esperar 2s (o 5s) y luego "playing"
    setTimeout(() => {
      this.uiState = 'playing';
      this.iniciarModo(); // Enciende la webcam y carga la pregunta
    }, 2500);
  }
  


  // ======================================================
  // 1) Iniciar Modo => solo ENCIENDE la cámara, NO graba
  // ======================================================
  iniciarModo(): void {
    this.hasStarted = true;
    this.showWebcam = true;
    
    // Encendemos la cámara, pero NO empezamos a grabar todavía.
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        this.videoStream = stream;
        const videoEl: HTMLVideoElement = this.videoElement.nativeElement;
        videoEl.srcObject = stream;
        videoEl.play();

        // Configuramos el MediaRecorder, pero NO lo iniciamos aún
        this.mediaRecorder = new MediaRecorder(stream);
        this.recordedChunks = [];
        
        // Event: Se van acumulando datos en recordedChunks
        this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
          if (event.data.size > 0) {
            this.recordedChunks.push(event.data);
          }
        };

        // Event: Al parar la grabación => genera blob
        this.mediaRecorder.onstop = () => {
          const videoBlob = new Blob(this.recordedChunks, { type: 'video/webm' });
          this.recordedVideoUrl = URL.createObjectURL(videoBlob);
          console.log("Video grabado =>", this.recordedVideoUrl);
        };

        // Cargamos la pregunta
        this.cargarNuevaPregunta();

      })
      .catch((err) => {
        console.error("Error al encender cámara:", err);
        this.showWebcam = false;
      });
  }

  // ======================================================
  // 2) "Empezar a grabar" => mediaRecorder.start()
  // ======================================================
  startRecording(): void {
    if (this.mediaRecorder && !this.isRecording) {
      this.recordedChunks = [];
      this.mediaRecorder.start();  // -> ahora sí graba
      this.isRecording = true;
      console.log("Grabando...");
    }
  }

  // ======================================================
  // 3) "Terminar de grabar"
  // ======================================================
  terminarGrabacion(): void {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
      console.log("Grabación finalizada.");
    }
    // 1) Apaga la cámara
    this.stopWebcam();
    this.showWebcam = false;
  
    // 2) Muestra el video que se grabó
    this.showRecordedVideo = true;
  }

  // ======================================================
  // CARGAR UNA NUEVA PREGUNTA AL INICIO
  // ======================================================
  cargarNuevaPregunta(): void {
    this.cargandoPregunta = true;
    this.resultado = '';
    this.optionStatus = {};

    this.examenService.generarPregunta().subscribe({
      next: (resp) => {
        this.questionId = resp.questionId;
        this.animaciones = resp.animaciones;
        this.opciones = resp.opciones;
        this.cargandoPregunta = false;

        // Buscar la opción correcta => para la "currentWord"
        const correctId = resp.correctAnswerId;
        const correctOption = this.opciones.find(o => o._id === correctId);
        if (correctOption) {
          if (this.usedWords.includes(correctOption.palabra)) {
            console.warn('Palabra repetida, cargando otra pregunta...');
            this.cargarNuevaPregunta();
            return;
          }else {
            this.currentWord = correctOption.palabra;
            this.usedWords.push(correctOption.palabra);

          }
        } else {
          this.currentWord = 'Cargando...';
          console.warn('Opción correcta no encontrada');
        }

        // Cargar animaciones en el canvas
        if (this.canvasRef) {
          this.canvasRef.stopLoop(false);
          const animacionesUrls = this.animaciones.map(a =>
            `${environment.apiUrl}/gltf/animaciones/${a.filename}`
          );
          this.animacionService.cargarAnimaciones(animacionesUrls, true, false);
        }
      },
      error: (err) => {
        console.error('Error al generar pregunta:', err);
        this.cargandoPregunta = false;
      }
    });
  }

  // ======================================================
  // Opciones => Seleccionar Opción
  // ======================================================
  seleccionarOpcion(opcionId: string): void {
    // El GUESSER elige la opción => scoreboard para guesser
    this.examenService.verificarRespuesta(this.sessionId, this.questionId, opcionId).subscribe({
      next: (resp) => {
        this.optionStatus[opcionId] = resp.esCorrecta ? 'correct' : 'incorrect';
        this.resultado = resp.esCorrecta ? '¡Respuesta correcta!' : 'Respuesta incorrecta';
  
        // Actualizar scoreboard AL GUESSER
        if (this.guesserName === this.player1Name) {
          this.player1Score[this.player1Index] = resp.esCorrecta ? 'hit' : 'miss';
          this.player1Index++; // Incrementar DESPUÉS de actualizar el score
        } else {
          this.player2Score[this.player2Index] = resp.esCorrecta ? 'hit' : 'miss';
          this.player2Index++; // Incrementar DESPUÉS de actualizar el score
        }
        
        // Comprobar si hay ganador después de actualizar índices
        this.checkForWinner();
      },
      error: (err) => {/* ... */}
    });
  }

  // ======================================================
  // Menú (radio buttons) => reproducir anim / stop / webcam...
  // ======================================================
  onRadioChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const valor = input.value;

    const animUrls = this.animaciones.map(a =>
      `${environment.apiUrl}/gltf/animaciones/${a.filename}`
    );

    switch (valor) {
      case 'play':
        this.animacionService.cargarAnimaciones(animUrls, true, false);
  this.selectedTool = 'play';

  // Deseleccionar automáticamente cuando acabe (3 segundos aprox)
  setTimeout(() => {
    this.deseleccionarRadio();
  }, 4000); // SEGUNDOS QUE DURA LA ANIMACIÓN PARA DESELECCIONAR EL PLAY
  break;
      case 'play2':
        this.animacionService.cargarAnimaciones(animUrls, true, true);
        break;
      case 'stop':
        if (this.canvasRef) {
          this.canvasRef.stopLoop(true);
        }
        break;
      case 'webcam':
        this.toggleWebcam();
        break;
      case 'veloc':
        console.log('Cambiar velocidad (demo)');
        break;
    }
  }
  deseleccionarRadio(): void {
    const radios = document.querySelectorAll('input[name="value-radio"]') as NodeListOf<HTMLInputElement>;
    radios.forEach(radio => radio.checked = false);
    this.selectedTool = '';
  }
  
  // ======================================================
  // Reproducir animación al hacer click en la palabra
  // ======================================================
  handleWordClick(): void {
    if (this.animaciones?.length > 0) {
      const animUrls = this.animaciones.map(a =>
        `${environment.apiUrl}/gltf/animaciones/${a.filename}`
      );
      this.animacionService.cargarAnimaciones(animUrls, true, false);
    }
  }

  // ======================================================
  // Mostrar/ocultar la webcam (sin grabar)
  // ======================================================
  toggleWebcam(): void {
    if (!this.showWebcam) {
      this.startWebcam();
    } else {
      this.stopWebcam();
    }
    this.showWebcam = !this.showWebcam;
  }

  startWebcam(): void {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        const videoEl: HTMLVideoElement = this.videoElement.nativeElement;
        videoEl.srcObject = stream;
        videoEl.play();
      })
      .catch((err) => console.error('Error al iniciar webcam:', err));
  }
  stopWebcam(): void {
    const videoEl: HTMLVideoElement = this.videoElement.nativeElement;
    const stream = videoEl.srcObject as MediaStream;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    videoEl.srcObject = null;
  }

  // ======================================================
  // Navegación
  // ======================================================
  navigateTo(destination: string): void {
    if (destination === 'perfil') {
      this.router.navigate(['/perfil']);
    } else if (destination === 'ajustes') {
      this.router.navigate(['/ajustes']);
    }
  }

  logout(): void {
    this.usuariosService.logout().subscribe({
      next: () => {
        this.router.navigate(['/landing']);
      },
      error: (err) => {
        console.error('Error al cerrar sesión:', err);
        alert('Error al cerrar sesión');
      }
    });
  }

  volverAModos(): void {
    this.usedWords = [];
    this.router.navigate(['/modos']);
  }

  nextTurn(): void {
    // Intercambiar signer <-> guesser
    const temp = this.signerName;
    this.signerName = this.guesserName;
    this.guesserName = temp;

    // Limpieza
    this.showRecordedVideo = false;
    this.resultado = '';
    
    this.currentTurnName = this.signerName;

    // Comprobar si alguien ganó (opcional)
    // - Por ejemplo, si un jugador tiene 2 hits y el otro no puede alcanzarle...

    // Volver a "turnAnnounce"
    this.uiState = 'turnAnnounce';
    setTimeout(() => {
      this.uiState = 'playing';
      // Apagamos media previa si hace falta
      // y llamamos a iniciarModo() o sólo cargarNuevaPregunta(), según tu flow
      this.iniciarModo();
    }, 2000);
  }

  private checkForWinner(): boolean {
    const p1Hits = this.player1Score.filter(s => s === 'hit').length;
    const p2Hits = this.player2Score.filter(s => s === 'hit').length;
    
    // Si no estamos en muerte súbita
    if (!this.isSuddenDeath) {
      // Verificar si ambos jugadores han completado sus 3 turnos
      const p1Complete = this.player1Index === 3;
      const p2Complete = this.player2Index === 3;
      
      // Caso 1: Si ambos han completado sus turnos
      if (p1Complete && p2Complete) {
        if (p1Hits > p2Hits) {
          this.ganador = this.player1Name;
          this.uiState = 'finPartida';
          this.triggerConfetti();
          return true;
        } else if (p2Hits > p1Hits) {
          this.ganador = this.player2Name;
          this.uiState = 'finPartida';
          this.triggerConfetti();
          return true;
        } else {
          // Empate: activar muerte súbita
          this.isSuddenDeath = true;
          console.log('¡Muerte súbita activada después de empate!');
          return false;
        }
      }
      
      // Caso 2: Si uno ha completado sus turnos pero el otro no
      if (p1Complete && !p2Complete) {
        // Solo declaramos ganador al player1 si es matemáticamente imposible para player2 alcanzarlo
        const p2PossibleHits = p2Hits + (3 - this.player2Index);
        if (p1Hits > p2PossibleHits) {
          this.ganador = this.player1Name;
          this.uiState = 'finPartida';
          this.triggerConfetti();
          return true;
        }
      }
      
      if (p2Complete && !p1Complete) {
        // Solo declaramos ganador al player2 si es matemáticamente imposible para player1 alcanzarlo
        const p1PossibleHits = p1Hits + (3 - this.player1Index);
        if (p2Hits > p1PossibleHits) {
          this.ganador = this.player2Name;
          this.uiState = 'finPartida';
          this.triggerConfetti();
          return true;
        }
      }
      
      // Caso 3: Ninguno ha completado sus turnos
      // Comprobamos si matemáticamente es imposible para uno alcanzar al otro
      if (!p1Complete && !p2Complete) {
        const p1PossibleHits = p1Hits + (3 - this.player1Index);
        const p2PossibleHits = p2Hits + (3 - this.player2Index);
        
        if (p1Hits > p2PossibleHits) {
          this.ganador = this.player1Name;
          this.uiState = 'finPartida';
          this.triggerConfetti();
          return true;
        }
        
        if (p2Hits > p1PossibleHits) {
          this.ganador = this.player2Name;
          this.uiState = 'finPartida';
          this.triggerConfetti();
          return true;
        }
      }
    } else {
      // En muerte súbita:
      // Solo comprobamos ganador cuando ambos han tirado el mismo número de veces
      if (this.player1Index === this.player2Index) {
        if (p1Hits > p2Hits) {
          this.ganador = this.player1Name;
          this.uiState = 'finPartida';
          this.triggerConfetti();
          return true;
        } else if (p2Hits > p1Hits) {
          this.ganador = this.player2Name;
          this.uiState = 'finPartida';
          this.triggerConfetti();
          return true;
        }
        // Si están empatados, continúa la muerte súbita
      }
    }
    
    return false;
  }


  private triggerConfetti(): void {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }
  
  
  /**
   * endGame: Limpia o navega a otra ruta. Por ejemplo:
   */
  private endGame(): void {
    // Si quieres reiniciar, hazlo aquí
    // this.resetScores(); // si deseas
    // O redirigir a la pantalla de modos:
    this.router.navigate(['/modos']);
  }
  
  
  onToggleLoop(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
  
    if (checked) {
      this.isLooping = true;
      this.reproducirAnimacion(true);  // con bucle
    } else {
      this.isLooping = false;
      this.canvasRef?.stopLoop(true);  // parar animación
    }
  }
  private reproducirAnimacion(loop: boolean): void {
    const animacionesUrls = this.animaciones.map(a =>
      `${environment.apiUrl}/gltf/animaciones/${a.filename}`
    );
  
    this.animacionService.cargarAnimaciones(animacionesUrls, true, loop);
  }
    
}
