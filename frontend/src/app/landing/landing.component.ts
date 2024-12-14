import { Component, ElementRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { LoginComponent } from '../login/login.component';
import { RegistroComponent } from '../registro/registro.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing',
  standalone: true,
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
  encapsulation: ViewEncapsulation.None,  // Desactiva el encapsulamiento
  imports: [CommonModule, LoginComponent, RegistroComponent]
})
export class LandingComponent {
  isRegisterVisible: boolean = false; // Mostrar el login por defecto

  @ViewChild('registerSection') registerSection!: ElementRef;
  @ViewChild('loginSection') loginSection!: ElementRef;

  // Mostrar la sección de registro y hacer scroll
  showRegister(): void {
    this.isRegisterVisible = true;

    setTimeout(() => {
      this.scrollToSection(this.registerSection);
    }, 0);
  }

  // Mostrar la sección de inicio de sesión y hacer scroll
  showLogin(): void {
    this.isRegisterVisible = false;

    setTimeout(() => {
      this.scrollToSection(this.loginSection);
    }, 0);
  }

  private scrollToSection(section: ElementRef): void {
    if (section) {
      section.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}

