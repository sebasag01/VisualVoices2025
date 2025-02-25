import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  private statsUrl = `${environment.apiUrl}/stats`;

  constructor(private http: HttpClient) {}

  startLevel(userId: string, level: number): Observable<any> {
    return this.http.post(`${this.statsUrl}/start-level`, { userId, level }, { withCredentials: true });
  }

  endLevel(statsId: string): Observable<any> {
    return this.http.patch(`${this.statsUrl}/end-level/${statsId}`, {}, { withCredentials: true });
  }
}
