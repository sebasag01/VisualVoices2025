import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CanvasComponent } from '../canvas/canvas.component';
import { HeaderComponent } from '../header/header.component';
import { FormsModule } from '@angular/forms';

import { Router } from '@angular/router';
import { CategoriasService } from '../services/categorias.service';
import { AnimacionService } from '../services/animacion.service';
import { PalabrasService } from '../services/palabras.service';
import { UsuariosService } from '../services/usuarios.service';
import { ExploredWordsService } from '../services/explored_word.service';
import { StatsService } from '../services/stats.service';

import { environment } from '../../environments/environment';
import introJs from 'intro.js';

@Component({
  selector: 'app-modo-libre',
  standalone: true,
  imports: [CommonModule, CanvasComponent, HeaderComponent, FormsModule],
  templateUrl: './modo-libre.component.html',
  styleUrls: ['./modo-libre.component.css']
})
export class ModoLibreComponent implements OnInit, OnDestroy {
  // Referencia al CanvasComponent
  @ViewChild(CanvasComponent) canvasRef!: CanvasComponent;

  categorias: any[] = [];
  selectedCategory: any = null;
  palabrasDeCategoriaSeleccionada: any[] = [];

  currentAnimationUrls: string[] = [];
  numeroPalabrasResumen = 2;

  @ViewChild('videoElement', { static: false }) videoElement!: ElementRef;
  showWebcam = false;

  isOpen = false;
  searchText: string = '';
  selectedCategoryIds: string[] = [];

  userId: string = '';
  currentStatsId: string | null = null;

  selectedWord: any = null;
  hasClickedWord = false;
  toolMenuOpen = false;

  constructor(
    private router: Router,
    private categoriasService: CategoriasService,
    private animacionService: AnimacionService,
    private palabrasService: PalabrasService,
    private usuariosService: UsuariosService,
    private exploredWordsService: ExploredWordsService,
    private statsService: StatsService
  ) {}

  ngOnInit(): void {
    this.cargarCategorias();

    // Obtener user y arrancar stats
    this.usuariosService.getAuthenticatedUser().subscribe({
      next: (resp) => {
        const user = resp.usuario;

        this.userId = user.uid;

        // Por ejemplo, iniciar la sesión en modo libre:
        this.statsService.startMode(user.uid, 'libre').subscribe({
          next: (resp) => {
            this.currentStatsId = resp.statsId;
            console.log('Sesión modo libre iniciada. statsId:', this.currentStatsId);
          },
          error: (err) => console.error('Error al iniciar modo libre:', err)
        });
      },
      error: (err) => console.error('Error user:', err)
    });

    document.addEventListener('click', this.handleClickOutside.bind(this));
  }

  ngOnDestroy(): void {
    if (this.currentStatsId) {
      this.statsService.endMode(this.currentStatsId).subscribe({
        next: (resp) => {
          console.log('Sesión modo libre cerrada. Duración:', resp.durationMs);
        },
        error: (err) => console.error('Error al cerrar sesión modo libre:', err)
      });
    }
  }

  // **************************************
  // CAMBIO DE PALABRA => DETENER ANIMACIÓN, POSE INICIAL
  // **************************************
  seleccionarPalabra(palabra: any): void {
    // 1) Parar lo que esté corriendo y volver a la pose inicial
    if (this.canvasRef) {
      this.canvasRef.stopLoop(true); // revertToDefault = true
    }

    // 2) Guardar la palabra
    this.selectedWord = palabra;

    // 3) Si es la primera vez que clican, abrimos menú
    if (!this.hasClickedWord) {
      this.toolMenuOpen = true;
      this.hasClickedWord = true;
    }
  }

  // **************************************
  // RADIOS: Play / Play2 / Webcam / Veloc / Stop
  // **************************************
  onRadioChange(event: Event) {
    const valor = (event.target as HTMLInputElement).value;

    // “stop” no requiere una palabra
    if (!this.selectedWord && valor !== 'stop') {
      alert('Primero selecciona una palabra.');
      return;
    }

    switch (valor) {
      case 'play':
        // Reproducir 1 sola vez
        this.reproducirAnimacion(false);
        break;
      case 'play2':
        // Reproducir en loop
        this.reproducirAnimacion(true);
        break;
      case 'webcam':
        this.toggleWebcam();
        break;
      case 'veloc':
        this.cambiarVelocidad();
        break;
      case 'stop':
        // Parar manualmente => pose inicial
        if (this.canvasRef) {
          this.canvasRef.stopLoop(true);
        }
        break;
    }
  }

  private reproducirAnimacion(loop: boolean) {
    if (!this.selectedWord) return;

    if (this.selectedWord.animaciones?.length > 0) {
      const animacionesUrls = this.selectedWord.animaciones.map((anim: any) =>
        `${environment.apiUrl}/gltf/animaciones/${anim.filename}`
      );

      // Llamamos a animacionService con loop
      this.animacionService.cargarAnimaciones(animacionesUrls, true, loop);

      // Registrar exploración
      this.usuariosService.explorarPalabraLibre(this.userId, this.selectedWord._id).subscribe({
        next: (resp) => {
          console.log('Palabra explorada. totalExploradas:', resp.totalExploradas);
          this.exploredWordsService.setExploredCount(resp.totalExploradas);
        },
        error: (err) => console.error('Error al marcar explorada:', err)
      });
    } else {
      console.warn('No hay animaciones en la palabra seleccionada');
    }
  }

  private cambiarVelocidad() {
    console.log('Cambiar velocidad (demo)');
  }

  // **************************************
  // WEBCAM => se puede usar a la vez
  // **************************************
  toggleWebcam() {
    // No bloqueamos el menú => se puede reproducir con la webcam activa
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
      .catch((err) => console.error('Error webcam:', err));
  }

  stopWebcam() {
    const video: HTMLVideoElement = this.videoElement.nativeElement;
    const stream = video.srcObject as MediaStream;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    video.srcObject = null;
  }

  // **************************************
  // CATEGORÍAS
  // **************************************
  cargarCategorias(): void {
    this.categoriasService.obtenerCategorias().subscribe({
      next: (data) => {
        this.categorias = data;
        // Cargar las palabras
        this.categorias.forEach(cat => {
          this.categoriasService.obtenerPalabrasPorCategoria(cat._id).subscribe({
            next: (palabras) => {
              cat.palabras = palabras;
            },
            error: (e) => console.error(e)
          });
        });
      },
      error: (error) => console.error('Error al cargar cat:', error),
    });
  }

  onCategoryClick(cat: any): void {
    this.selectedCategory = cat;
    this.categoriasService.obtenerPalabrasPorCategoria(cat._id).subscribe({
      next: (palabras) => {
        this.palabrasDeCategoriaSeleccionada = palabras;
      },
      error: (e) => console.error(e)
    });
  }

  volverAListaCategorias(): void {
    this.selectedCategory = null;
    this.palabrasDeCategoriaSeleccionada = [];
    this.toolMenuOpen = false;
    this.selectedWord = null;
    this.hasClickedWord = false;
  }

  getPrimerasPalabras(cat: any): string {
    if (!cat.palabras || cat.palabras.length === 0) {
      return 'Sin palabras';
    }
    const primeras = cat.palabras.slice(0, this.numeroPalabrasResumen).map((p: any) => p.palabra);
    return primeras.join(', ');
  }

  // **************************************
  // FILTRO / BÚSQUEDA
  // **************************************
  get filteredCategoriesBySearch(): any[] {
    if (!this.searchText) return this.categorias;

    const lowerSearch = this.searchText.toLowerCase();
    return this.categorias.filter(cat => {
      const catMatches = cat.nombre.toLowerCase().includes(lowerSearch);
      const wordMatches = cat.palabras?.some((p: any) =>
        p.palabra.toLowerCase().includes(lowerSearch)
      );
      return catMatches || wordMatches;
    });
  }

  onSearchInput(): void {}
  onInputFocus(): void {
    this.isOpen = true;
  }
  performSearch(): void {}

  get filteredCategories(): any[] {
    if (this.selectedCategoryIds.length === 0) return this.categorias;
    return this.categorias.filter(cat => this.selectedCategoryIds.includes(cat._id));
  }

  onCheckboxChange(event: Event, cat: any) {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      if (!this.selectedCategoryIds.includes(cat._id)) {
        this.selectedCategoryIds.push(cat._id);
      }
    } else {
      this.selectedCategoryIds = this.selectedCategoryIds.filter(id => id !== cat._id);
    }
  }

  // **************************************
  // DROPDOWN
  // **************************************
  handleClickOutside(): void {
    if (this.isOpen) {
      this.isOpen = false;
    }
  }
  toggleDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.isOpen = !this.isOpen;
  }

  // **************************************
  // NAVEGACIÓN
  // **************************************
  navigateTo(destination: string) {
    if (destination === 'admin') {
      this.router.navigate(['/admin']);
    } else if (destination === 'ajustes') {
      this.router.navigate(['/ajustes']);
    } else if (destination === 'perfil') {
      this.router.navigate(['/perfil']);
    }
  }

  volverAModos(): void {
    if (this.currentStatsId) {
      this.statsService.endMode(this.currentStatsId).subscribe({
        next: (resp) => {
          console.log('Sesión libre cerrada. Duración(ms):', resp.durationMs);
          this.router.navigate(['/modos']);
        },
        error: (err) => {
          console.error('Error al cerrar sesion libre:', err);
          this.router.navigate(['/modos']);
        }
      });
    } else {
      this.router.navigate(['/modos']);
    }
  }

  // **************************************
  // TUTORIAL
  // **************************************
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

  // **************************************
  // LOGOUT
  // **************************************
  logout(): void {
    console.log('Cerrando sesión modo libre...');
    this.usuariosService.logout().subscribe({
      next: (resp) => {
        console.log('Logout ok:', resp);
        this.router.navigate(['/landing']);
      },
      error: (error) => {
        console.error('Error logout:', error);
        alert('Error al cerrar sesión.');
      },
    });
  }
}
