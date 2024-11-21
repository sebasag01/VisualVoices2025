import { Component, OnInit } from '@angular/core';
import { UsuariosService } from '../services/usuarios.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Importa FormsModule


@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  standalone: true,
  imports: [CommonModule,FormsModule]
})
export class UsuariosComponent implements OnInit {
  usuarios: any[] = [];
  usuarioSeleccionado: any = null;
  user = { email: '', username: '', password: '' };
  userLogin = { email: '', password: '' };

  constructor(private usuariosService: UsuariosService) {}

  ngOnInit() {
    this.obtenerUsuarios();
  }

  obtenerUsuarios() {
    this.usuariosService.getUsuarios().subscribe(
      data => {
        console.log('Datos recibidos:', data);
        this.usuarios = data;
      },
      error => {
        console.error('Error al obtener usuarios:', error);
      }
    );
  }

  registerUser() {
    this.usuariosService.register(this.user).subscribe(
      response => {
        console.log(response.message);
        // Opcional: resetear el formulario
        this.user = { email: '', username: '', password: '' };
      },
      error => {
        console.error('Error en el registro:', error);
      }
    );
  }

  loginUser() {
    this.usuariosService.login(this.userLogin).subscribe(
      response => {
        console.log(response.message);
        // Opcional: resetear el formulario
        this.userLogin = { email: '', password: '' };
      },
      error => {
        console.error('Error en el inicio de sesión:', error);
      }
    );
  }

  eliminarUsuario(id: string) {
    this.usuariosService.deleteUsuario(id).subscribe(() => {
      this.obtenerUsuarios(); // Actualiza la lista después de eliminar
    });
  }

  seleccionarUsuario(usuario: any) {
    this.usuarioSeleccionado = { ...usuario }; // Crea una copia del usuario
  }

  actualizarUsuario() {
    if (this.usuarioSeleccionado) {
      this.usuariosService.updateUsuario(this.usuarioSeleccionado.id, this.usuarioSeleccionado).subscribe(() => {
        this.obtenerUsuarios(); // Actualiza la lista después de editar
        this.usuarioSeleccionado = null; // Reinicia el usuario seleccionado
      });
    }
  }
}
