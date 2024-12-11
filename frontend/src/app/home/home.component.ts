import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { CategoriasService } from '../services/categorias.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent], 
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  categorias: any[] = []; // Lista de categorías obtenidas de la base de datos
  palabras: any[] = []; // Lista de palabras obtenidas de la base de datos
  currentCategoryId: string | null = null; // Categoría actual seleccionada

  constructor(private categoriasService: CategoriasService) {}

  ngOnInit(): void {
    this.cargarCategorias(); // Cargar las categorías al inicio
  }

  cargarCategorias(): void {
    this.categoriasService.obtenerCategorias().subscribe({
      next: (data) => {
        this.categorias = data;
        console.log('Categorías cargadas:', this.categorias);
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
        console.log(`Palabras cargadas para la categoría ${categoriaId}:`, this.palabras);
      },
      error: (error) => {
        console.error('Error al cargar las palabras:', error);
      },
    });
  }

  seleccionarPalabra(palabra: any): void {
    console.log('Palabra seleccionada:', palabra);
  }
}
