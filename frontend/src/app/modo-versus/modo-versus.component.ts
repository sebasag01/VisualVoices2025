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

  uiState: 'nombres' | 'turnAnnounce' | 'playing' = 'nombres';


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

    // Esperar 2s (o 5s) y luego "playing"
    setTimeout(() => {
      this.uiState = 'playing';
      this.iniciarModo(); // Enciende la webcam y carga la pregunta
    }, 2000);
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
          this.currentWord = correctOption.palabra;
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
    // Verificamos
    this.examenService.verificarRespuesta(this.questionId, opcionId).subscribe({
      next: (resp) => {

        this.optionStatus[opcionId] = resp.esCorrecta ? 'correct' : 'incorrect';

        this.resultado = resp.esCorrecta ? '¡Respuesta correcta!' : 'Respuesta incorrecta';

        // Actualizar scoreboard AL GUESSER
        if (this.guesserName === this.player1Name) {
          this.player1Score[this.player1Index] = resp.esCorrecta ? 'hit' : 'miss';
          if (this.player1Index < 2) this.player1Index++;
        } else {
          this.player2Score[this.player2Index] = resp.esCorrecta ? 'hit' : 'miss';
          if (this.player2Index < 2) this.player2Index++;
        }
        // Comprobar si hay ganador
        if (this.checkForWinner()) {
          // Si checkForWinner() detectó ganador y llamó a endGame(),
          // puedes retornar para no hacer más
          return;
        }
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
    
    const p1ShotsUsed = this.player1Index; 
    const p2ShotsUsed = this.player2Index; 
  
    // 1) fase normal => compruebo inalcanzable
    if (!this.isSuddenDeath) {
      const p1ShotsLeft = 3 - p1ShotsUsed;
      const p2ShotsLeft = 3 - p2ShotsUsed;
  
      // 1A) P1 inalcanzable
      if ((p1Hits - p2Hits) > p2ShotsLeft) {
        alert(`${this.player1Name} gana la partida, inalcanzable!`);
        this.endGame(); 
        return true;
      }
      // 1B) P2 inalcanzable
      if ((p2Hits - p1Hits) > p1ShotsLeft) {
        alert(`${this.player2Name} gana la partida, inalcanzable!`);
        this.endGame();
        return true;
      }
  
      // 1C) Se han jugado los 3 tiros cada uno
      if (p1ShotsUsed === 3 && p2ShotsUsed === 3) {
        if (p1Hits > p2Hits) {
          alert(`${this.player1Name} gana la partida!`);
          this.endGame();
          return true;
        } else if (p2Hits > p1Hits) {
          alert(`${this.player2Name} gana la partida!`);
          this.endGame();
          return true;
        } else {
          // == EMPATE => activamos muerte súbita
          alert('¡Empate! Entramos en muerte súbita...');
          this.isSuddenDeath = true;
          return false; // no hay ganador aún
        }
      }
    } else {
      // 2) FASE MUERTE SÚBITA:
      // Queremos ver si ambos han hecho la misma cantidad de disparos extra
      // (Ej: p1ShotsUsed = 4, p2ShotsUsed = 4 => completaron 1 "ronda" en muerte súbita)
      if (p1ShotsUsed > 3 && p2ShotsUsed > 3 && p1ShotsUsed === p2ShotsUsed) {
        if (p1Hits > p2Hits) {
          alert(`${this.player1Name} anota en muerte súbita y gana!`);
          this.endGame();
          return true;
        } else if (p2Hits > p1Hits) {
          alert(`${this.player2Name} anota en muerte súbita y gana!`);
          this.endGame();
          return true;
        } else {
          // Ambos fallaron o ambos acertaron => Siguen empatados => otra ronda
          alert('Misma ronda en muerte súbita => siguen empatados, siguiente tiro...');
          // no hay ganador, siguen
          return false;
        }
      }
    }
  
    // Si llegamos aquí => no hay ganador todavía
    return false;
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
  
  

}
