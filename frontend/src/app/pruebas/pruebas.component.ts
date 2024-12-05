import { Component, OnInit } from '@angular/core';
import { CategoriasService } from '../services/categorias.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pruebas',
  templateUrl: './pruebas.component.html',
  styleUrls: ['./pruebas.component.css'],
  standalone: true,
  imports: [CommonModule], // Importa CommonModule para usar *ngFor y *ngIf
})
export class PruebasComponent implements OnInit {
  categorias: any[] = [];
  palabras: any[] = [];

  constructor(private categoriasService: CategoriasService) {}

  ngOnInit(): void {
    this.cargarCategorias();
  }

  cargarCategorias(): void {
    this.categoriasService.obtenerCategorias().subscribe((data) => {
      this.categorias = data;
    });
  }

  mostrarPalabras(categoria: any): void {
    console.log(`Enviando solicitud para la categoría: ${categoria._id}`);
    this.categoriasService.obtenerPalabrasPorCategoria(categoria._id).subscribe(
      (data) => {
        this.palabras = data;
        console.log(`Palabras mostradas para la categoría ${categoria.nombre}:`, this.palabras);
      },
      (error) => {
        console.error('Error al obtener palabras por categoría:', error);
      }
    );
  }

  accionPalabra(palabra: any): void {
    console.log(`Botón de palabra pulsado: ${palabra.palabra}`);
    // Simula una respuesta de estado 200
    console.log(`Estado: 200, Palabra seleccionada: ${palabra.palabra}`);
    // Aquí puedes añadir la lógica para que el avatar realice la acción asociada.
  }

}
