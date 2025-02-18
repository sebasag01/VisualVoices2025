import { Component } from '@angular/core';
import { UsuariosService } from '../services/usuarios.service';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router'; 
import {EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [FormsModule,RouterModule,CommonModule],
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css'],
})
export class RegistroComponent {
  user = { email: '', password: '', repeatPassword: '', nombre: '', apellidos: '' };
  passwordFieldType: string = 'password'; // Controla si el campo es 'password' o 'text'
  passwordMismatch: boolean = false; // Variable para indicar que las contraseñas no coinciden
  showPasswordHint: boolean = false; // Controla la visibilidad del hint

  @Output() toggleLogin = new EventEmitter<void>();  


  constructor(private usuariosService: UsuariosService, private router: Router,private toastr: ToastrService) {}
 
  checkPasswordMatch(): void {
    this.passwordMismatch = (this.user.password !== this.user.repeatPassword);
  }

  registerUser() {

    // Validar que las contraseñas coincidan antes de enviar
    if (this.user.password !== this.user.repeatPassword) {
      this.passwordMismatch = true;
      return; // No continuar con el registro
    } else {
      this.passwordMismatch = false;
    }

    console.log('Datos enviados:', this.user); // Log para verificar los datos
    this.usuariosService.register(this.user).subscribe({
      next: (response) => {
        console.log('Registro exitoso:', response);
        this.toastr.success('Usuario registrado con éxito', 'Éxito');
        this.router.navigate(['/home']); // Redirigir a la página 'home'
      },
      error: (error) => {
        console.error('Error en el registro:', error);
        this.toastr.error('Error al registrar usuario', 'Error');
      },
    });
  }

  togglePasswordVisibility(): void {
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
  }

  isPasswordValid(): boolean {
    const pwd = this.user.password;
    // Requisitos: 8-12 caracteres, al menos una mayúscula, una minúscula, un dígito y un carácter especial
    const regex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()]).{8,12}$/;
    return regex.test(pwd);
  }


}
