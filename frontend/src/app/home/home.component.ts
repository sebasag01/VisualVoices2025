import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { CategoriasService } from '../services/categorias.service';
import { CanvasComponent } from '../canvas/canvas.component';
import { AnimacionService } from '../services/animacion.service'; // Importa el servicio
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { CardComponent } from "../card/card.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, CanvasComponent, CardComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  categorias: any[] = [];
  palabras: any[] = [];
  currentCategoryId: string | null = null;
  currentAnimationUrls: string[] = [];
  modo: string = 'libre'; // Nuevo: Valor predeterminado
  Math: any;

  constructor(
    private router: Router,
    private categoriasService: CategoriasService,
    private animacionService: AnimacionService
  ) {}

  ngOnInit(): void {
    this.cargarCategorias();
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
  }
}
