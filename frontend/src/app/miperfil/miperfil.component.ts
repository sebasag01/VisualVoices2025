import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UsuariosService } from '../services/usuarios.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';  // ✅ Importado FormsModule para usar ngModel
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-miperfil',
  templateUrl: './miperfil.component.html',
  styleUrls: ['./miperfil.component.css'],
  standalone: true,
  imports: [HeaderComponent, FooterComponent, CommonModule, FormsModule] // ✅ Agregado FormsModule
})
export class MiperfilComponent implements OnInit {
  userData: any = {}; // Ahora es un objeto genérico

  isEditing: Record<string, boolean> = {
    username: false,
    fullname: false,
    email: false,
    imagen: false, // Agregado para evitar errores si se usa en la interfaz
    password: false
  };

  emailUsuario: string = 'angeladmin@gmail.com';  // Asignamos manualmente el email

  constructor(private usuarioService: UsuariosService, private router: Router) {}

  ngOnInit() {
    this.loadUserData();
  }

  loadUserData() {

    this.userData.email = this.emailUsuario;  // Asignamos el email manualmente a userData

    this.usuarioService.getAuthenticatedUser().subscribe({
      next: (data) => {
        console.log('Datos recibidos:', data); // Verificando los datos recibidos
        const user = data.usuario; // Asegurándote de acceder al objeto usuario
        this.userData = user;
    
        // Verificar que el email esté cargado correctamente
        if (user && user.email) {
          this.emailUsuario = user.email;
          console.log('Email del usuario:', this.emailUsuario); // Verificar que el email está correcto
        } else {
          console.log('Email no disponible para este usuario');
        }
      },
      error: (error) => {
        console.error('Error al cargar los datos del usuario:', error);
      }
    });
    
    
  }

  toggleEdit(field: string) {  // Cambié el tipo de field a 'string' para flexibilidad
    if (this.isEditing[field]) {
      const updatedField = { [field]: this.userData[field] };
      this.usuarioService.updateUsuario(this.userData.email, updatedField).subscribe(
        () => {
          this.isEditing[field] = false;
        },
        (error) => {
          console.error('Error al actualizar:', error);
        }
      );
    } else {
      this.isEditing[field] = true;
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.userData.imagen = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  navigateTo(destination: string) {
    this.router.navigate([`/${destination}`]);
  }

  logout(): void {
    console.log('[DEBUG] Cerrando sesión desde Modo Libre...');
    this.usuarioService.logout().subscribe({
      next: (response) => {
        console.log('[DEBUG] Respuesta del logout:', response);
        this.router.navigate(['/landing']);
      },
      error: (error) => {
        console.error('[ERROR] Error al cerrar sesión:', error);
        alert('Error al cerrar sesión.');
      },
    });
  }

  volverAModos(): void {
    this.router.navigate(['/modos']);
  }
}
