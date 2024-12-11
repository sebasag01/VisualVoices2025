import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  imports: [CommonModule]
})
export class HeaderComponent {
  selectedMode: string = 'modo1';
  dropdownOpen: boolean = false;
  mobileMenuOpen: boolean = false;
  isMobile: boolean = window.innerWidth <= 768;

  constructor(private router: Router) {
    // Escuchar cambios en la navegación
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.updateSelectedModeFromUrl(event.urlAfterRedirects);
      }
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.isMobile = window.innerWidth <= 768;
    if (!this.isMobile) {
      this.mobileMenuOpen = false;
    }
  }

  selectMode(mode: string) {
    this.router.navigate([mode === 'modo1' ? '/home' : '/guiado']);
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  toggleMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMenus() {
    this.dropdownOpen = false;
    this.mobileMenuOpen = false;
  }

  navigateTo(destination: string) {
    this.closeMenus();
    console.log(`Navigating to ${destination}`);
  }

  logout() {
    this.closeMenus();
    console.log('Logging out...');
  }

  private updateSelectedModeFromUrl(url: string) {
    if (url.includes('/home')) {
      this.selectedMode = 'modo1';
    } else if (url.includes('/guiado')) {
      this.selectedMode = 'modo2';
    } else {
      this.selectedMode = ''; // Opcional: manejar rutas no definidas
    }
  }
}
