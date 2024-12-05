import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoriasService {
  private baseUrl = `${environment.apiUrl}/categorias`;

  constructor(private http: HttpClient) {}

  obtenerCategorias(): Observable<any> {
    return this.http.get(`${this.baseUrl}`);
  }
  
  obtenerPalabrasPorCategoria(categoriaId: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/palabras/categoria?categoria=${categoriaId}`);
}

}
