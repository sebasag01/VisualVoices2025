import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation, OnDestroy  } from '@angular/core';
import { LoginComponent } from '../login/login.component';
import { RegistroComponent } from '../registro/registro.component';
import { CommonModule } from '@angular/common';
import { CanvasComponent } from '../canvas/canvas.component';
import { AnimacionService } from '../services/animacion.service';
import { environment } from '../../environments/environment';
import { HeaderComponent } from '../header/header.component';

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';


@Component({
  selector: 'app-landing',
   standalone: true,
   templateUrl: './landing.component.html',
   styleUrls: ['./landing.component.css'],
   encapsulation: ViewEncapsulation.None,  // Desactiva el encapsulamiento
  imports: [CommonModule, LoginComponent, RegistroComponent,CanvasComponent, HeaderComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class LandingComponent implements OnInit, OnDestroy {
  isRegisterVisible: boolean = false;

  private waveInterval: any;

  showRegister() {
    this.isRegisterVisible = true;
  }

  showLogin() {
    this.isRegisterVisible = false;
  }

  constructor(private animacionService: AnimacionService) {}

  ngOnInit(): void {
    this.cargarAnimacionHola();  // Cargar la animación al inicio

    this.waveInterval = setInterval(() => {
      this.cargarAnimacionHola();
    }, 10000);
  }

  ngOnDestroy(): void {
    // Limpiar el intervalo cuando se destruya el componente (buena práctica)
    if (this.waveInterval) {
      clearInterval(this.waveInterval);
    }
  }

  private cargarAnimacionHola(): void {
    // 1er bloque (rápido)
    const primerBloque = ['padre_0.gltf','padre_1.gltf','padre_2.gltf'];
    
    // 2do bloque (resto)
    const segundoBloque = Array.from({ length: 13 }, (_, i) => `padre_${i+3}.gltf`);
    
    // Enviar todo junto (o primero enviamos solo el bloque1, luego bloque2).
    const urlsPrimerBloque = primerBloque.map(a => `${environment.apiUrl}/gltf/animaciones/${a}`);
    const urlsSegundoBloque = segundoBloque.map(a => `${environment.apiUrl}/gltf/animaciones/${a}`);
  
    // Mandar primero el bloque rápido
    this.animacionService.cargarAnimaciones(urlsPrimerBloque, true);
  
    // (Opcional) un pequeño retraso para el segundo, o en paralelo
    setTimeout(() => {
      this.animacionService.cargarAnimaciones(urlsSegundoBloque, true);
    }, 500);
  }
  
  
}


// @Component({
//   selector: 'app-landing',
//   standalone: true,
//   templateUrl: './landing.component.html',
//   styleUrls: ['./landing.component.css'],
//   encapsulation: ViewEncapsulation.None,  // Desactiva el encapsulamiento
//   imports: [CommonModule, LoginComponent, RegistroComponent,CanvasComponent],
//   schemas: [CUSTOM_ELEMENTS_SCHEMA]
// })
// export class LandingComponent {
//   environment = environment;
//   isRegisterVisible: boolean = false; // Mostrar el login por defecto

//   @ViewChild('registerSection') registerSection!: ElementRef;
//   @ViewChild('loginSection') loginSection!: ElementRef;

//   // Mostrar la sección de registro y hacer scroll
//   showRegister(): void {
//     this.isRegisterVisible = true;
//     setTimeout(() => {
//       const container = document.getElementById('container-abajo');
//       if (container) {
//         container.scrollIntoView({ behavior: 'smooth' });
//       }
//     }, 100);
//   }

//   // Mostrar la sección de inicio de sesión y hacer scroll
//   showLogin(): void {
//     this.isRegisterVisible = false;
//     setTimeout(() => {
//       const container = document.getElementById('container-abajo');
//       if (container) {
//         container.scrollIntoView({ behavior: 'smooth' });
//       }
//     }, 100);
//   }

//   private scrollToSection(section: ElementRef): void {
//     if (section) {
//       section.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
//     }
//   }
// }
