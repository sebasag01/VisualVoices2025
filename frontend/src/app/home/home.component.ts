import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Importar CommonModule
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent], // Agregar CommonModule aquí
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  currentCategory: 'saludos' | 'necesidades' | 'familia' = 'saludos'; // Categoría por defecto

  words = {
    saludos: ['Hola', 'Adiós', 'Gracias', 'Perdón', 'Qué tal'],
    necesidades: ['Comer', 'Beber', 'Dormir', 'Baño', 'Ayuda'],
    familia: ['Mamá', 'Papá', 'Amigo', 'Hermano', 'Familia'],
  };

  filteredWords: string[] = this.words[this.currentCategory];

  selectCategory(category: 'saludos' | 'necesidades' | 'familia') {
    this.currentCategory = category;
    this.filteredWords = this.words[category];
  }
}
