import { Component } from '@angular/core';
import { UsuariosService } from '../services/usuarios.service';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router'; // Añadir la importación de RouterModule



@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule,RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  userLogin = { email: '', password: '' }; // Modelo para el formulario de login

  constructor(private usuariosService: UsuariosService) {}

  loginUser() {
    this.usuariosService.login(this.userLogin).subscribe({
      next: (response) => {
        console.log('Login exitoso:', response);
        localStorage.setItem('token', response.token); // Guardar el token en localStorage
        alert('Inicio de sesión exitoso');
      },
      error: (error) => {
        console.error('Error en el inicio de sesión:', error);
        alert('Error en el inicio de sesión. Revisa tus credenciales.');
      },
    });
  }
}
