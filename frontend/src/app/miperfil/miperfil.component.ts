import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UsuariosService } from '../services/usuarios.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';  // ✅ Importado FormsModule para usar ngModel
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';


@Component({
  selector: 'app-miperfil',
  templateUrl: './miperfil.component.html',
  styleUrls: ['./miperfil.component.css'],
  standalone: true,
  imports: [HeaderComponent, FooterComponent, CommonModule, FormsModule, NgxChartsModule] // ✅ Agregado FormsModule
})
export class MiperfilComponent implements OnInit {
  single = [
    { "name": "Usuarios", "value": 40632 },
    { "name": "Palabras", "value": 50000 },
    { "name": "Tiempo de uso", "value": 36745 },
    { "name": "Niveles", "value": 36240 },
    // { "name": "Spain", "value": 33000 },
    // { "name": "Italy", "value": 35800 }
  ];

  // Configuración de la gráfica
  view: [number, number] = [900, 500]; // Tamaño de la gráfica
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  showXAxisLabel = true;
  xAxisLabel = '';
  showYAxisLabel = true;
  yAxisLabel = '';

  colorScheme = 'vivid'; // O puedes usar 'cool', 'cooldown', 'flame', etc.

  userData: any = {}; // Ahora es un objeto genérico

  isEditing: Record<string, boolean> = {
    username: false,
    fullname: false,
    email: false,
    imagen: false, // Agregado para evitar errores si se usa en la interfaz
    password: false
  };

  emailUsuario: string = '';  // Asignamos manualmente el email
  isModalOpen: boolean = false;
  isPasswordModalOpen: boolean = false;  // Nueva variable para gestionar el modal de contraseña


  
  // Variables para el formulario
  currentEmail: string = '';  // Email introducido por el usuario
  newEmail: string = '';      // Nuevo email a actualizar
  emailError: string | null = null;  // Mensaje de error

  // Variables para el formulario de cambio de contraseña
  currentPassword: string = ''; 
  newPassword: string = '';      
  confirmPassword: string = ''; 
  passwordError: string | null = null;


  constructor(private usuarioService: UsuariosService, private router: Router) {}

  ngOnInit() {
    this.loadUserData();
  }

  loadUserData() {

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

  updateEmail() {
    if (this.currentEmail !== this.emailUsuario) {
      this.emailError = 'El email actual no es correcto';
      return; // Si no coincide, mostramos el error
    }
  
    // Verificar que el UID del usuario esté presente
    if (!this.userData.uid) {
      console.error('UID del usuario no encontrado.');
      alert('Hubo un problema al actualizar el email. El identificador del usuario no está disponible.');
      return; // No proceder si el UID no está presente
    }
  
    // Si los emails coinciden, realizamos la actualización
    const updatedEmail = { email: this.newEmail };
  
    console.log('Enviando solicitud para actualizar email:', updatedEmail);  // Depuración
    console.log('UID del usuario:', this.userData.uid); // Verificar que el UID esté disponible
  
    // Usamos el UID en lugar de ID
    this.usuarioService.updateUsuario(this.userData.uid, updatedEmail).subscribe({
      next: () => {
        this.emailUsuario = this.newEmail; // Actualizamos el email en la sesión
        this.closeModal(); // Cerramos el modal
        alert('Email actualizado correctamente');
      },
      error: (error) => {
        console.error('Error al actualizar el email:', error);
        if (error && error.message) {
          alert('Hubo un problema al actualizar el email. Detalles: ' + error.message);
        } else {
          alert('Hubo un problema al actualizar el email.');
        }
      }
    });
  }
  
  // Método para actualizar la contraseña
  updatePassword() {
    if (this.newPassword !== this.confirmPassword) {
      this.passwordError = 'Las contraseñas no coinciden.';
      return; // Si no coinciden, mostramos el error
    }

    // Si las contraseñas coinciden, realizamos la actualización
    const updatedPassword = { password: this.newPassword };

    this.usuarioService.updateUsuario(this.userData.email, updatedPassword).subscribe({
      next: () => {
        alert('Contraseña actualizada correctamente');
        this.closePasswordModal(); // Cerramos el modal de contraseña
      },
      error: (error) => {
        console.error('Error al actualizar la contraseña:', error);
        alert('Hubo un problema al actualizar la contraseña.');
      }
    });
  }

  // Abrir el modal de editar contraseña
  openPasswordModal() {
    this.isPasswordModalOpen = true;
    this.passwordError = null;  // Limpiamos el error cuando se abre el modal
  }

  // Cerrar el modal de editar contraseña
  closePasswordModal() {
    this.isPasswordModalOpen = false;
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

  // Métodos para abrir y cerrar el modal
  openModal() {
    this.isModalOpen = true;
    this.emailError = null;  // Limpiamos el error cuando se abre el modal

  }

  closeModal() {
    this.isModalOpen = false;
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
