import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

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

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.isMobile = window.innerWidth <= 768;
    if (!this.isMobile) {
      this.mobileMenuOpen = false;
    }
  }

  selectMode(mode: string) {
    this.selectedMode = mode;
    this.closeMenus();
    console.log(`Navigating to ${mode}`);
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
}
