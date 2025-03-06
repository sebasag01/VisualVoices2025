import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CanvasComponent } from '../canvas/canvas.component';
import { CategoriasService } from '../services/categorias.service';
import { AnimacionService } from '../services/animacion.service';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { PalabrasService } from '../services/palabras.service';
import { UsuariosService } from '../services/usuarios.service';
import { ExploredWordsService } from '../services/explored_word.service'; // Importante
import introJs from 'intro.js';
import { HeaderComponent } from '../header/header.component';
import { StatsService } from '../services/stats.service';
import { FormsModule } from '@angular/forms'; // ¡Importante para [(ngModel)]!
@Component({
  selector: 'app-modo-libre',
  standalone: true,
  imports: [CommonModule, CanvasComponent, HeaderComponent, FormsModule],
  templateUrl: './modo-libre.component.html',
  styleUrls: ['./modo-libre.component.css']
})
export class ModoLibreComponent implements OnInit, OnDestroy  {
  categorias: any[] = [];
  selectedCategory: any = null; // para saber si estamos en la vista de "palabras"
  palabrasDeCategoriaSeleccionada: any[] = [];

  currentAnimationUrls: string[] = [];

  // Para mostrar un pequeño resumen de las palabras en la vista de categorías
  numeroPalabrasResumen = 2; // o 3, ajusta a tu gusto

  // Para controlar la cámara
  @ViewChild('videoElement', { static: false }) videoElement!: ElementRef;
  showWebcam = false;

  // Para controlar la visibilidad del dropdown
  isOpen = false;
  searchText: string = '';
  // Array con los IDs de las categorías seleccionadas
  selectedCategoryIds: string[] = [];

  // ID del usuario (para explorarPalabraLibre)
  userId: string = '';

  currentStatsId: string | null = null; // Asegúrate de almacenar el ID de la sesión

  selectedWord: any = null;       // Palabra que está seleccionada
  hasClickedWord: boolean = false; // Para saber si es la primera vez que se cliquea
  toolMenuOpen: boolean = false;   // Controla que el menú esté abierto o cerrado

  constructor(
    private router: Router,
    private categoriasService: CategoriasService,
    private animacionService: AnimacionService,
    private palabrasService: PalabrasService,
    private usuariosService: UsuariosService,
    private exploredWordsService: ExploredWordsService, // Inyectamos para registrar exploraciones
    private statsService: StatsService
  ) {}

  seleccionarPalabra(palabra: any): void {
    // 1) Guardamos la palabra seleccionada
    this.selectedWord = palabra;
    
    // 2) Si es la primera palabra clicada en esta sesión de modo libre:
    if (!this.hasClickedWord) {
      this.toolMenuOpen = true;   // Abrimos el menú
      this.hasClickedWord = true; // Marcamos que ya se ha cliqueado al menos una vez
    }

    // 3) Reproducimos la animación (tal como ya lo hacías)
    if (palabra.animaciones && palabra.animaciones.length > 0) {
      const animacionesUrls = palabra.animaciones.map(
        (animacion: any) => `${environment.apiUrl}/gltf/animaciones/${animacion.filename}`
      );
      this.animacionService.cargarAnimaciones(animacionesUrls, true);
    } else {
      console.warn('No hay animaciones asociadas a esta palabra.');
    }

    // 4) Registrar exploración en BD (modo libre), etc.
    this.usuariosService.explorarPalabraLibre(this.userId, palabra._id).subscribe({
      next: (resp) => {
        console.log('Palabra explorada. Lleva ', resp.totalExploradas, ' en total');
        this.exploredWordsService.setExploredCount(resp.totalExploradas);
      },
      error: (err) => {
        console.error('Error al marcar como explorada:', err);
      }
    });
  }

  ngOnInit(): void {
    // 1) Cargar categorías
    this.cargarCategorias();

    // 2) Obtener userId
    this.usuariosService.getAuthenticatedUser().subscribe({
      next: (resp) => {
        const user = resp.usuario;
        // Por ejemplo, iniciar la sesión en modo libre:
        this.statsService.startMode(user.uid, 'libre').subscribe({
          next: (resp) => {
            this.currentStatsId = resp.statsId;
            console.log('Sesión de modo libre iniciada, statsId:', this.currentStatsId);
          },
          error: (err) => console.error('Error al iniciar sesión en modo libre:', err)
        });
      },
      error: (err) => console.error('Error obteniendo usuario autenticado:', err)
    });

    // Cerrar el dropdown si haces clic fuera
    document.addEventListener('click', this.handleClickOutside.bind(this));
  }

  volverAModos(): void {
    console.log('Volviendo a modos...');
    if (this.currentStatsId) {
      this.statsService.endMode(this.currentStatsId).subscribe({
        next: (resp) => {
          console.log('Sesión de modo libre cerrada. Duración (ms):', resp.durationMs);
          // Navegar a la vista de modos tras cerrar la sesión
          this.router.navigate(['/modos']);
        },
        error: (err) => {
          console.error('Error al cerrar la sesión de modo libre:', err);
          // Aun en caso de error, intenta navegar a modos
          this.router.navigate(['/modos']);
        }
      });
    } else {
      // Si no hay sesión abierta, navega directamente
      this.router.navigate(['/modos']);
    }
  }

  ngOnDestroy(): void {
    if (this.currentStatsId) {
      this.statsService.endMode(this.currentStatsId).subscribe({
        next: (resp) => {
          console.log('Sesión de modo libre cerrada. Duración:', resp.durationMs);
        },
        error: (err) => console.error('Error al cerrar la sesión de modo libre:', err)
      });
    }
  }

  /**
   * Al iniciar, recargas "cat.palabras" para cada categoría, lo que
   * ya tenías implementado. Así en "cat.palabras" tendremos la lista
   * de palabras de esa categoría.
   */
  cargarCategorias(): void {
    this.categoriasService.obtenerCategorias().subscribe({
      next: (data) => {
        this.categorias = data;

        // Cargar las palabras de cada categoría
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
   * Este getter filtra las categorías según el texto buscado:
   * - Si la categoría coincide en su nombre con searchText,
   *   la mostramos.
   * - O si alguna de sus palabras coincide, también la mostramos.
   */
   get filteredCategoriesBySearch(): any[] {
    if (!this.searchText) {
      // Si no hay texto, devolvemos todas
      return this.categorias;
    }

    const lowerSearch = this.searchText.toLowerCase();
    return this.categorias.filter(cat => {
      const catMatches = cat.nombre.toLowerCase().includes(lowerSearch);
      const wordMatches = cat.palabras?.some((p: any) => 
        p.palabra.toLowerCase().includes(lowerSearch)
      );
      return catMatches || wordMatches;
    });
  }
  /**
   * Cuando el usuario escribe en el input, simplemente
   * actualizamos "searchText" (via ngModel) y con eso
   * se recalcula el getter filteredCategoriesBySearch.
   */
  onSearchInput(): void {
    // Si quieres, podrías hacer algo extra; por ahora, no hace falta.
  }

  /**
   * Al enfocar el input, abrimos el desplegable.
   */
  onInputFocus(): void {
    this.isOpen = true;
  }

  /**
   * Al hacer clic en buscar (botón lupa), puedes forzar algo extra,
   * aunque no es estrictamente necesario porque el filtrado es "live".
   */
  performSearch(): void {
    // Por ejemplo, podrías cerrar el dropdown:
    // this.isOpen = false;
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
    // Añade esta línea
  this.toolMenuOpen = false;
  // opcionalmente, limpiar la palabra seleccionada
  this.selectedWord = null;
  // Restablecer la variable para que la próxima vez que
  // entremos a vista 2 y cliquemos una palabra, se abra el menú
  this.hasClickedWord = false;
  }

 

  /**
   * Maneja el click en el checkbox (seleccionar/deseleccionar categorías).
   */
  onCheckboxChange(event: Event, cat: any) {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      if (!this.selectedCategoryIds.includes(cat._id)) {
        this.selectedCategoryIds.push(cat._id);
      }
    } else {
      this.selectedCategoryIds = this.selectedCategoryIds.filter(id => id !== cat._id);
    }
    console.log('Seleccionados:', this.selectedCategoryIds);
  }

  // Si hacemos clic fuera del dropdown, se cierra
  handleClickOutside(): void {
    if (this.isOpen) {
      this.isOpen = false;
    }
  }

 /**
   * Muestra/oculta el dropdown al hacer clic en el área de la barra,
   * pero sin cerrarlo cuando hacemos clic en el interior del propio dropdown.
   */
 toggleDropdown(event: MouseEvent): void {
  event.stopPropagation();
  this.isOpen = !this.isOpen;
}

  // Navegación
  navigateTo(destination: string) {
    if (destination === 'admin') {
      this.router.navigate(['/admin']);
    } else if (destination === 'ajustes') {
      this.router.navigate(['/ajustes']);
    } else if (destination === 'perfil') {
      this.router.navigate(['/perfil']);
    }
  }

  // Introducción (tutorial)
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

  // Control de webcam
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

}
