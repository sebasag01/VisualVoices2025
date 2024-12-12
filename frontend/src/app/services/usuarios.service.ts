import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment'; // Importar el entorno
import { HttpHeaders } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private apiUrl = environment.apiUrl; // Utilizar la URL desde el entorno

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
    return this.http.post(`${this.apiUrl}/usuarios`, user);
  }

  // Iniciar sesión de usuario
  login(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, user, { withCredentials: true }); // Asegúrate de usar 'withCredentials'
  }
  
  

  // Actualizar un usuario por ID
  updateUsuario(id: string, usuario: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, usuario);
  }

  // Eliminar un usuario por ID
  deleteUsuario(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getAuthenticatedUser(): Observable<any> {
    return this.http.get(`${this.apiUrl}/login/usuario`, { withCredentials: true });
  }




}
