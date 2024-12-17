import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { CardComponent } from '../card/card.component';
import { PalabrasService } from '../services/palabras.service'; // Importa el servicio
import { CanvasComponent } from '../canvas/canvas.component';
import { AnimacionService } from '../services/animacion.service'; // Importa el servicio

@Component({
  selector: 'app-modo-guiado',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, CardComponent,CanvasComponent],
  templateUrl: './modo-guiado.component.html',
  styleUrls: ['./modo-guiado.component.css'],
})
export class ModoGuiadoComponent implements OnInit {
  words: any[] = []; // Lista dinámica de palabras
  currentIndex = 0; // Índice actual de la palabra
  maxWords = 5; // Limitar las palabras mostradas (opcional)

  constructor(private palabrasService: PalabrasService) {}

  ngOnInit(): void {
    this.cargarPalabras(); // Cargar las palabras al iniciar
  }

  // Método para cargar palabras desde el servicio
  cargarPalabras(): void {
    this.palabrasService.obtenerPalabras().subscribe({
      next: (data) => {
        this.words = data.slice(0, this.maxWords); // Limitar el número de palabras
        console.log('Palabras cargadas desde la base de datos:', this.words);
      },
      error: (error) => {
        console.error('Error al cargar las palabras:', error);
      },
    });
  }

  // Propiedad para obtener la palabra actual
  get currentWord() {
    const word = this.words[this.currentIndex]?.palabra || 'Cargando...';
    console.log('Palabra actual:', word);
    return word;
  }
  
  get currentExplanation() {
    const explanation = this.words[this.currentIndex]?.explicacion || 'Sin explicación disponible';
    console.log('Explicación actual:', explanation);
    return explanation;
  }

  // Evento para el clic del botón de palabra
  handleWordClick() {
    console.log(`Botón de palabra pulsado: ${this.currentWord}`);
  }

  // Evento para repetir la acción
  handleRepeatClick() {
    console.log(`Repetir acción para: ${this.currentWord}`);
  }

  // Cambiar a la palabra anterior
  prevWord() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }

  // Cambiar a la siguiente palabra
  nextWord() {
    if (this.currentIndex < this.words.length - 1) {
      this.currentIndex++;
    }
  }
}
