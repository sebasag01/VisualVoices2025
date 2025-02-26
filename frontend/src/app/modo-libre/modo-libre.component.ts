import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CanvasComponent } from '../canvas/canvas.component';
import { CategoriasService } from '../services/categorias.service';
import { AnimacionService } from '../services/animacion.service';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { PalabrasService } from '../services/palabras.service';
import { UsuariosService } from '../services/usuarios.service';
import introJs from 'intro.js';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-modo-libre',
  standalone: true,
  imports: [CommonModule, CanvasComponent, HeaderComponent],
  templateUrl: './modo-libre.component.html',
  styleUrls: ['./modo-libre.component.css']
})
export class ModoLibreComponent implements OnInit {
  categorias: any[] = [];
  selectedCategory: any = null;    // Cuando sea != null, mostramos la lista de palabras
  palabrasDeCategoriaSeleccionada: any[] = [];
  currentAnimationUrls: string[] = [];

  // Para mostrar un pequeño resumen de las palabras en la vista de categorías
  numeroPalabrasResumen = 2; // o 3, ajusta a tu gusto

  @ViewChild('videoElement', { static: false }) videoElement!: ElementRef;
  showWebcam = false;

  // Para controlar la visibilidad del dropdown
  isOpen = false;

  // Array con los IDs de las categorías seleccionadas
  selectedCategoryIds: string[] = [];

  constructor(
    private router: Router,
    private categoriasService: CategoriasService,
    private animacionService: AnimacionService,
    private palabrasService: PalabrasService,
    private usuariosService: UsuariosService
  ) {}

  ngOnInit(): void {
    this.cargarCategorias();
    // Cerrar el dropdown si haces clic fuera
    document.addEventListener('click', this.handleClickOutside.bind(this));
  }

  cargarCategorias(): void {
    this.categoriasService.obtenerCategorias().subscribe({
      next: (data) => {
        this.categorias = data;

        // Cargar las palabras de cada categoría (para el resumen)
        this.categorias.forEach(cat => {
          this.categoriasService.obtenerPalabrasPorCategoria(cat._id).subscribe({
            next: (palabras) => {
              cat.palabras = palabras;
            },
            error: (e) => console.error(e)
          });
        });
      },
      error: (error) => {
        console.error('Error al cargar las categorías:', error);
      },
    });
  }

  /**
   * Getter que filtra automáticamente las categorías
   * según las que estén seleccionadas en selectedCategoryIds.
   * Si no hay nada marcado, mostramos todas.
   */
  get filteredCategories(): any[] {
    if (this.selectedCategoryIds.length === 0) {
      return this.categorias;
    }
    return this.categorias.filter(cat =>
      this.selectedCategoryIds.includes(cat._id)
    );
  }

  /**
   * Retorna un string con las primeras N palabras de la categoría
   */
  getPrimerasPalabras(cat: any): string {
    if (!cat.palabras || cat.palabras.length === 0) {
      return 'Sin palabras';
    }
    const primeras = cat.palabras
      .slice(0, this.numeroPalabrasResumen)
      .map((p: any) => p.palabra);

    return primeras.join(', ');
  }

  /**
   * Cuando hacemos clic en una categoría, cargamos TODAS sus palabras 
   * y cambiamos la vista.
   */
  onCategoryClick(cat: any): void {
    this.selectedCategory = cat;
    this.categoriasService.obtenerPalabrasPorCategoria(cat._id).subscribe({
      next: (palabras) => {
        this.palabrasDeCategoriaSeleccionada = palabras;
      },
      error: (e) => console.error(e)
    });
  }

  /**
   * Vuelve a la lista de categorías
   */
  volverAListaCategorias(): void {
    this.selectedCategory = null;
    this.palabrasDeCategoriaSeleccionada = [];
  }

  /**
   * Cuando clicas en una palabra, reproduces la animación en el avatar
   */
  seleccionarPalabra(palabra: any): void {
    if (palabra.animaciones && palabra.animaciones.length > 0) {
      const animacionesUrls = palabra.animaciones.map(
        (animacion: any) => `${environment.apiUrl}/gltf/animaciones/${animacion.filename}`
      );
      this.animacionService.cargarAnimaciones(animacionesUrls, true);
    } else {
      console.warn('No hay animaciones asociadas a esta palabra.');
    }
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

  // Mostrar/ocultar el dropdown
  toggleDropdown(event: MouseEvent): void {
    event.stopPropagation(); // Evitamos que el click se propague y se cierre
    this.isOpen = !this.isOpen;
  }

  // Maneja el click en el checkbox
  onCheckboxChange(event: Event, cat: any) {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      // Agregar el ID si no está
      if (!this.selectedCategoryIds.includes(cat._id)) {
        this.selectedCategoryIds.push(cat._id);
      }
    } else {
      // Quitar el ID si se desmarca
      this.selectedCategoryIds = this.selectedCategoryIds.filter(
        id => id !== cat._id
      );
    }

    console.log('Seleccionados:', this.selectedCategoryIds);
    // El get filteredCategories() se recalculará solo.
  }

  // Si hacemos clic fuera del dropdown, se cierra
  handleClickOutside(): void {
    if (this.isOpen) {
      this.isOpen = false;
    }
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

  toggleWebcam() {
    if (!this.showWebcam) {
      // Activar la cámara
      this.startWebcam();
    } else {
      // Desactivar la cámara
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
