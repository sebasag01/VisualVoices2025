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

  //inicia una sesión de examen
  startSession(): Observable<{ sessionId: string }> {
    return this.http.post<{ ok: boolean; sessionId: string }>(
      `${this.examApiUrl}/start-session`,
      {},
      { withCredentials: true }
    );
  }

  generarPregunta(): Observable<any> {
    // GET /api/examen/generar
    return this.http.get(`${this.examApiUrl}/generar`, { withCredentials: true });
  }

  verificarRespuesta(
    sessionId: string,
    questionId: string,
    selectedAnswerId: string
  ): Observable<any> {
    const payload = { sessionId, questionId, selectedAnswerId };
    return this.http.post(`${this.examApiUrl}/verificar`, payload, { withCredentials: true });
  }
}
