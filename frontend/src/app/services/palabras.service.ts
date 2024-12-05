import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PalabrasService {
    private baseUrl = `${environment.apiUrl}/palabras`;

  constructor(private http: HttpClient) {}

  obtenerPalabras(): Observable<any> {
    return this.http.get(`${this.baseUrl}`);
  }

  obtenerPalabra(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  crearPalabra(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}`, data);
  }

  editarPalabra(id: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, data);
  }

  borrarPalabra(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  asociarCategoria(id: string, categoria: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${id}/categoria`, { categoria });
  }
}
