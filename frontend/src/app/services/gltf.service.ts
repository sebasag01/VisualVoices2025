import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GltfService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Obtener un modelo GLTF por nombre de archivo
  getModelByFilename(filename: string): Observable<Blob> {
    const headers = new HttpHeaders({
      'Accept': 'model/gltf+json'
    });

    return this.http.get(`${this.apiUrl}/gltf/animaciones/${filename}`, {
      headers,
      responseType: 'blob'
    }).pipe(
      tap(response => console.log('Modelo recibido correctamente')),
      catchError(error => {
        console.error('Error al obtener el modelo:', error);
        return throwError(() => error);
      })
    );
  }

  // Obtener la primera animación disponible
  getDefaultModel(): Observable<Blob> {
    return this.getModelByFilename('hola.gltf');
  }
}
