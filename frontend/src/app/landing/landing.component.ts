import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { LoginComponent } from '../login/login.component';
import { RegistroComponent } from '../registro/registro.component';
import { CommonModule } from '@angular/common';
import { CanvasComponent } from '../canvas/canvas.component';
import { AnimacionService } from '../services/animacion.service';
import { environment } from '../../environments/environment';

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';


@Component({
  selector: 'app-landing',
   standalone: true,
   templateUrl: './landing.component.html',
   styleUrls: ['./landing.component.css'],
   encapsulation: ViewEncapsulation.None,  // Desactiva el encapsulamiento
  imports: [CommonModule, LoginComponent, RegistroComponent,CanvasComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class LandingComponent implements OnInit {
  isRegisterVisible: boolean = false;

  showRegister() {
    this.isRegisterVisible = true;
  }

  showLogin() {
    this.isRegisterVisible = false;
  }

  constructor(private animacionService: AnimacionService) {}

  ngOnInit(): void {
    this.cargarAnimacionHola();  // Cargar la animación al inicio
  }

  private cargarAnimacionHola(): void {
    const animaciones = ['hola1.gltf', 'hola2.gltf', 'hola3.gltf']; // Archivos de la animación
    const animacionesUrls = animaciones.map(anim => `${environment.apiUrl}/gltf/animaciones/${anim}`);
    
    console.log('Cargando animación "Hola":', animacionesUrls);
    
    this.animacionService.cargarAnimaciones(animacionesUrls, true); // Cargar en el servicio
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
