// examen.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExamenService {
  private examApiUrl = `${environment.apiUrl}/examen`;

  constructor(private http: HttpClient) {}

  generarPregunta(): Observable<any> {
    // GET /api/examen/generar
    return this.http.get(`${this.examApiUrl}/generar`, { withCredentials: true });
  }

  verificarRespuesta(questionId: string, selectedAnswerId: string): Observable<any> {
    // POST /api/examen/verificar
    // Enviamos { questionId, selectedAnswerId }
    const payload = { questionId, selectedAnswerId };
    return this.http.post(`${this.examApiUrl}/verificar`, payload, { withCredentials: true });
  }
}
