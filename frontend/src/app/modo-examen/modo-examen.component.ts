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
  selector: 'app-modo-examen',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    CanvasComponent,
    FormsModule,
  ],
  templateUrl: './modo-examen.component.html',
  styleUrls: ['./modo-examen.component.css']
})
export class ModoExamenComponent implements OnInit, OnDestroy {

  @ViewChild(CanvasComponent) canvasRef!: CanvasComponent;
  @ViewChild('videoElement', { static: false }) videoElement!: ElementRef;

  questionId!: string;
  opciones: any[] = [];
  animaciones: any[] = [];
  resultado: string = '';
  cargandoPregunta: boolean = false;

  showWebcam: boolean = false;
  selectedOptionId: string = ''; // Nueva propiedad para almacenar la opción seleccionada

  constructor(
    private examenService: ExamenService,
    private usuariosService: UsuariosService,
    private animacionService: AnimacionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarNuevaPregunta();
  }

  ngOnDestroy(): void {
    // Si necesitas hacer limpieza cuando se destruya el componente
  }

  // ==========================================================
  // EXAMEN: Cargar una nueva pregunta
  // ==========================================================
  cargarNuevaPregunta(): void {
    this.cargandoPregunta = true;
    this.resultado = '';
    this.selectedOptionId = ''; // Reiniciamos la opción seleccionada

    this.examenService.generarPregunta().subscribe({
      next: (resp) => {
        // Resp => { questionId, animaciones, opciones }
        this.questionId = resp.questionId;
        this.animaciones = resp.animaciones;
        this.opciones = resp.opciones;
        this.cargandoPregunta = false;

        // Si deseas cargar las animaciones en CanvasComponent
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

  // ==========================================================
  // EXAMEN: Seleccionar opción
  // ==========================================================
  seleccionarOpcion(opcionId: string): void {
    this.selectedOptionId = opcionId; // Se guarda la opción seleccionada
    this.examenService.verificarRespuesta(this.questionId, opcionId).subscribe({
      next: (resp) => {
        const esCorrecta = resp.esCorrecta;
        this.resultado = esCorrecta ? '¡Respuesta correcta!' : 'Respuesta incorrecta';
        // Si se desea, se podría reiniciar la selección o cargar otra pregunta tras un tiempo
      },
      error: (err) => {
        console.error('Error al verificar respuesta:', err);
      }
    });
  }

  // ==========================================================
  // MENÚ DE BOTONES (radio buttons) => play / loop / stop / webcam / veloc
  // ==========================================================
  onRadioChange(event: Event): void {
    const valor = (event.target as HTMLInputElement).value;
    
    const animacionesUrls = this.animaciones.map(a =>
      `${environment.apiUrl}/gltf/animaciones/${a.filename}`
    );
  
    switch (valor) {
      case 'play':
        this.animacionService.cargarAnimaciones(animacionesUrls, true, false);
        break;
      case 'play2':
        this.animacionService.cargarAnimaciones(animacionesUrls, true, true);
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
  
  // ==========================================================
  // WEBCAM
  // ==========================================================
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
        const video: HTMLVideoElement = this.videoElement.nativeElement;
        video.srcObject = stream;
        video.play();
      })
      .catch((err) => console.error('Error webcam:', err));
  }

  stopWebcam(): void {
    const video: HTMLVideoElement = this.videoElement.nativeElement;
    const stream = video.srcObject as MediaStream;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    video.srcObject = null;
  }

  // ==========================================================
  // NAVEGACIÓN
  // ==========================================================
  navigateTo(destination: string): void {
    if (destination === 'perfil') {
      this.router.navigate(['/perfil']);
    } else if (destination === 'ajustes') {
      this.router.navigate(['/ajustes']);
    }
  }

  // ==========================================================
  // LOGOUT
  // ==========================================================
  logout(): void {
    this.usuariosService.logout().subscribe({
      next: (resp) => {
        console.log('Logout ok:', resp);
        this.router.navigate(['/landing']);
      },
      error: (err) => {
        console.error('Error logout:', err);
        alert('Error al cerrar sesión');
      }
    });
  }
}
