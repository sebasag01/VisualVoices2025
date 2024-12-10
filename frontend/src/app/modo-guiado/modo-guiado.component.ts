import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Importar CommonModule
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-modo-guiado',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent], // Agregar CommonModule aquí
  templateUrl: './modo-guiado.component.html',
  styleUrl: './modo-guiado.component.css'
})




export class ModoGuiadoComponent {
  
}
