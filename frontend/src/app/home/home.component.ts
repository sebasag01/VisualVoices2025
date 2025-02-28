import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { CategoriasService } from '../services/categorias.service';
import { CanvasComponent } from '../canvas/canvas.component';
import { AnimacionService } from '../services/animacion.service';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { CardComponent } from '../card/card.component';
import { UsuariosService } from '../services/usuarios.service';
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
  
  // Modo libre
  categorias: any[] = [];
  palabras: any[] = [];
  currentCategoryId: string | null = null;
  currentAnimationUrls: string[] = [];

  // Control de modo actual (libre, guiado, examen, etc.)
  modo: string = 'libre';

  // Usuario
  userId: string = '';

  // Cámara
  @ViewChild('videoElement', { static: false }) videoElement!: ElementRef;
  showWebcam = false;

  constructor(
    private router: Router,
    private categoriasService: CategoriasService,
    private animacionService: AnimacionService,
    private usuariosService: UsuariosService,
    private exploredWordsService: ExploredWordsService,
  ) {}

  ngOnInit(): void {
    // Cargar categorías del modo libre
    this.cargarCategorias();

    // Obtener datos de usuario (para registrar exploraciones, etc.)
    this.usuariosService.getAuthenticatedUser().subscribe({
      next: (resp) => {
        this.userId = resp.usuario.uid || resp.usuario._id;
      },
      error: (err) => {
        console.error('Error obteniendo usuario autenticado:', err);
      },
    });
  }

  cambiarModo(event: any): void {
    this.modo = event.target.value;
    console.log('Modo seleccionado:', this.modo);
    // Si quisieras navegar al componente de modo guiado, podrías hacer:
    // if (this.modo === 'guiado') {
    //   this.router.navigate(['/modo-guiado']);
    // }
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

    // Registrar exploración en BD (modo libre)
    this.usuariosService.explorarPalabraLibre(this.userId, palabra._id).subscribe({
      next: (resp) => {
        console.log('Palabra explorada. Lleva ', resp.totalExploradas, ' en total');
        // Actualizar BehaviorSubject con el total explorado
        this.exploredWordsService.setExploredCount(resp.totalExploradas);
      },
      error: (err) => {
        console.error('Error al marcar como explorada:', err);
      }
    });
  }

  iniciarTutorial() {
    const intro = introJs();
    intro.setOptions({
      steps: [
        {
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
          element: '#avatar-element',
          intro: 'Este es tu avatar 3D. ¡Puedes interactuar con él!',
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

  // ----------------------
  // Control de cámara
  // ----------------------
  toggleWebcam() {
    if (!this.showWebcam) {
      this.startWebcam();
    } else {
      this.stopWebcam();
    }
    this.showWebcam = !this.showWebcam;
  }

  startWebcam() {
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
