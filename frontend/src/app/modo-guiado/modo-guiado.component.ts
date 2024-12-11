import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Importar CommonModule
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { CardComponent } from '../card/card.component'; // Asegúrate de que la ruta sea correcta

@Component({
  selector: 'app-modo-guiado',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, CardComponent], // Agregar CardComponent
  templateUrl: './modo-guiado.component.html',
  styleUrls: ['./modo-guiado.component.css'] // Nota: aquí se usa `styleUrls` (no `styleUrl`)
})
export class ModoGuiadoComponent {
  // Lista de palabras con sus explicaciones
  words = [
    { word: 'Hola', explanation: 'Un saludo en español.' },
    { word: 'Adiós', explanation: 'Una despedida común en español.' },
    { word: 'Gracias', explanation: 'Una expresión de gratitud.' },
  ];

  currentIndex = 0; // Índice actual de la palabra

  // Propiedad para obtener la palabra actual
  get currentWord() {
    return this.words[this.currentIndex]?.word || '';
  }

  // Propiedad para obtener la explicación actual
  get currentExplanation() {
    return this.words[this.currentIndex]?.explanation || '';
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
