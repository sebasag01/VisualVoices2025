import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  private statsUrl = `${environment.apiUrl}/stats`;

  constructor(private http: HttpClient) {}

  startLevel(userId: string, level: number, mode: string = 'guiado'): Observable<any> {
    return this.http.post(`${this.statsUrl}/start-level`, { userId, level, mode }, { withCredentials: true });
  }
  
  

  endLevel(statsId: string): Observable<any> {
    return this.http.patch(`${this.statsUrl}/end-level/${statsId}`, {}, { withCredentials: true });
  }

  // stats.service.ts
  startMode(userId: string, mode: string, level?: number): Observable<any> {
    return this.http.post(`${this.statsUrl}/start-mode`, { userId, mode, level }, { withCredentials: true });
  }

  endMode(statsId: string): Observable<any> {
    return this.http.patch(`${this.statsUrl}/end-mode/${statsId}`, {}, { withCredentials: true });
  }

  getTiempoTotalLibre(userId: string): Observable<any> {
    return this.http.get(`${this.statsUrl}/libre-total/${userId}`, { withCredentials: true });
  }

  getSesionesDiarias(): Observable<any> {
    return this.http.get(`${this.statsUrl}/sesiones-diarias`, { withCredentials: true });
  }

  getProporcionUsuarios(): Observable<any> {
    return this.http.get(`${this.statsUrl}/proporcion-usuarios`, { withCredentials: true });
  }

  // Añadir al archivo stats.service.ts
  getHorasPico(): Observable<any> {
    return this.http.get(`${this.statsUrl}/horas-pico`, { withCredentials: true });
  }

  getScoreDistribution(): Observable<{ _id: number, count: number }[]> {
    return this.http.get<{ ok: boolean, data: { _id: number, count: number }[] }>(
      `${this.statsUrl}/scores-distribution`,
      { withCredentials: true }
    ).pipe(
      map(resp => resp.data)
    );
  }

  getTopFailedWords(): Observable<{ palabra: string, fails: number }[]> {
    return this.http
      .get<{ ok: boolean, data: { palabra: string, fails: number }[] }>(
        `${this.statsUrl}/top-failed-words`,
        { withCredentials: true }
      )
      .pipe(map(resp => resp.data));
  }

  getPerformanceEvolution(): Observable<{ _id: string, avgCorrectRate: number }[]> {
    return this.http.get<{ ok: boolean, data: { _id: string, avgCorrectRate: number }[] }>(
      `${this.statsUrl}/performance-evolution`,
      { withCredentials: true }
    ).pipe(
      map(resp => resp.data)
    );
  }

}
