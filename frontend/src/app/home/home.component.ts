import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { CategoriasService } from '../services/categorias.service';
import { CanvasComponent } from '../canvas/canvas.component';
import { AnimacionService } from '../services/animacion.service'; // Importa el servicio
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { CardComponent } from "../card/card.component";
import { PalabrasService } from '../services/palabras.service';
import { UsuariosService } from '../services/usuarios.service';
import { StatsService } from '../services/stats.service';
import { ExploredWordsService } from '../services/explored_word.service'; 

import introJs from 'intro.js';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, CanvasComponent, CardComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  
  // ----- PROPIEDADES DE MODO GUIADO -----
  words: any[] = [];          // Lista dinámica de palabras
  currentIndex = 0;           // Índice actual de la palabra
  maxWords = 3;               // Límite de palabras a mostrar
  nivelActual = 1;            // Nivel actual
  availableLevels = [1, 2];   // Niveles disponibles
  userId: string = '';        // ID del usuario en BD
  showWelcome = true;         // Mostrar pant. bienvenida
  showChooseLevel = false;    // Mostrar pantalla de elegir nivel
  
  //Estadisticas
  currentStatsId: string | null = null;

  categorias: any[] = [];
  palabras: any[] = [];
  currentCategoryId: string | null = null;
  currentAnimationUrls: string[] = [];
  modo: string = 'libre'; // Nuevo: Valor predeterminado
  Math: any;




  constructor(
    private router: Router,
    private categoriasService: CategoriasService,
    private animacionService: AnimacionService,
    private palabrasService: PalabrasService,
    private usuariosService: UsuariosService,
    private statsService: StatsService,
    private exploredWordsService: ExploredWordsService,


  ) {}

  ngOnInit(): void {
    this.cargarCategorias();
    this.usuariosService.getAuthenticatedUser().subscribe({
      next: (resp) => {
        this.userId = resp.usuario.uid || resp.usuario._id;
        this.nivelActual = resp.usuario.currentLevel || 1;
        this.currentIndex = resp.usuario.currentWordIndex || 0;
        // Cargar palabras de ese nivel
      },
      error: (err) => {
        console.error('Error obteniendo usuario autenticado:', err);
        // fallback: nivel 1
        this.nivelActual = 1;
        this.currentIndex = 0;
      },
    });
    this.usuariosService.getAuthenticatedUser().subscribe({
      next: (resp) => {
        this.userId = resp.usuario.uid || resp.usuario._id;
        this.nivelActual = resp.usuario.currentLevel || 1;
        this.currentIndex = resp.usuario.currentWordIndex || 0;
        // Cargar palabras de ese nivel
      },
      error: (err) => {
        console.error('Error obteniendo usuario autenticado:', err);
        // fallback: nivel 1
        this.nivelActual = 1;
        this.currentIndex = 0;
      },
    });
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

    this.usuariosService.explorarPalabraLibre(this.userId, palabra._id).subscribe({
      next: (resp) => {
        console.log('Palabra explorada. Lleva ', resp.totalExploradas, ' en total');

        // 3) Actualizar BehaviorSubject
        //   Con el número que te da el backend (totalExploradas):
        this.exploredWordsService.setExploredCount(resp.totalExploradas);
      },
      error: (err) => {
        console.error('Error al marcar como explorada:', err);
      }
    });
  }




}
