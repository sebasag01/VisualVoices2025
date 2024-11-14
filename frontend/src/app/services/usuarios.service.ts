import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private apiUrl = 'http://localhost:3000/api/usuarios'; // URL base para usuarios

  constructor(private http: HttpClient) {}

  // Obtener todos los usuarios
  getUsuarios(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  // Crear un nuevo usuario
  createUsuario(usuario: any): Observable<any> {
    return this.http.post(this.apiUrl, usuario);
  }

  // Registro de un nuevo usuario
  register(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user);
  }

  // Actualizar un usuario por ID
  updateUsuario(id: string, usuario: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, usuario);
  }

  // Eliminar un usuario por ID
  deleteUsuario(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
