import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface UserData {
  username: string;
  fullname: string;
  email: string;
  password: string;
  [key: string]: string; // Permite indexar con una clave string
}

@Component({
  selector: 'app-miperfil',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent],
  templateUrl: './miperfil.component.html',
  styleUrls: ['./miperfil.component.css']
})
export class MiperfilComponent {
  constructor(private router: Router) {}

  closePanel(): void {
    console.log('Cerrando panel de ajustes');
    this.router.navigate(['/guiado']);
  }

  // Datos simulados del usuario usando la interfaz UserData
  userData: UserData = {
    username: 'UsuarioDemo',
    fullname: 'Nombre Completo Demo',
    email: 'demo@email.com',
    password: '123456'
  };

  // Control de edición para cada campo
  isEditing: Record<string, boolean> = {
    username: false,
    fullname: false,
    email: false,
    password: false
  };

  toggleEdit(field: string): void {
    if (!this.isEditing[field]) {
      this.isEditing[field] = true;
    } else {
      this.isEditing[field] = false;
      console.log(`Campo '${field}' actualizado a:`, this.userData[field]);
    }
  }

  profileImage: string | null = 'assets/default-profile.png';

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.profileImage = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
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
}
