import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'https://visualvoices.ovh/api';

  constructor(private http: HttpClient) {}

  getHelloWorld(): Observable<any> {
    return this.http.get(`${this.apiUrl}/`, { responseType: 'json' }); // Asegúrate de que responseType sea 'json'
  }
  
}
