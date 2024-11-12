import { Component, OnInit } from '@angular/core';
import { UsuariosService } from '../services/usuarios.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  standalone: true,
  imports: [CommonModule]
})
export class UsuariosComponent implements OnInit {
  usuarios: any[] = [];
  usuarioSeleccionado: any = null;

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
