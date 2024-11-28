import { Component, ElementRef, ViewChild } from '@angular/core';
import { LoginComponent } from '../login/login.component';
import { RegistroComponent } from '../registro/registro.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing',
  standalone: true,
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
  imports: [CommonModule, LoginComponent, RegistroComponent]
})
export class LandingComponent {
  isRegisterVisible: boolean = true;

  @ViewChild('registerSection') registerSection!: ElementRef;
  @ViewChild('loginSection') loginSection!: ElementRef;

  // Mostrar la sección de registro y hacer scroll
  showRegister(): void {
    this.isRegisterVisible = true;

    // Esperar un ciclo para que Angular actualice el DOM antes de desplazarse
    setTimeout(() => {
      this.scrollToSection(this.registerSection);
    }, 0);
  }

  // Mostrar la sección de inicio de sesión y hacer scroll
  showLogin(): void {
    this.isRegisterVisible = false;

    // Esperar un ciclo para que Angular actualice el DOM antes de desplazarse
    setTimeout(() => {
      this.scrollToSection(this.loginSection);
    }, 0);
  }

  // Método para hacer scroll a la sección correspondiente
  private scrollToSection(section: ElementRef): void {
    if (section) {
      section.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
