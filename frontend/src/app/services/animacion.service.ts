import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AnimacionService {
  private animacionSubject = new BehaviorSubject<string[]>([]); // Inicializa con un array vacío
  animaciones$ = this.animacionSubject.asObservable();

  cargarAnimaciones(animaciones: string[]): void {
    this.animacionSubject.next(animaciones);
  }
}
