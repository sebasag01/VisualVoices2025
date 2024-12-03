import { Component } from '@angular/core';
import { UsuariosService } from '../services/usuarios.service';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router'; 
import {EventEmitter, Output } from '@angular/core';


@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [FormsModule,RouterModule],
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css'],
})
export class RegistroComponent {
  user = { email: '', password: '', nombre: '', apellidos: '' };
  @Output() toggleLogin = new EventEmitter<void>();  


  constructor(private usuariosService: UsuariosService) {}

  registerUser() {
    this.usuariosService.register(this.user).subscribe({
      next: (response) => {
        console.log('Registro exitoso:', response);
        alert('Usuario registrado con éxito.');
      },
      error: (error) => {
        console.error('Error en el registro:', error);
        alert('Error al registrar usuario.');
      },
    });
  }
}
