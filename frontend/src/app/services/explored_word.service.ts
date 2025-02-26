// explored-words.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExploredWordsService {
  // BehaviorSubject conserva el último valor y permite que los nuevos suscriptores
  // reciban la emisión más reciente inmediatamente.
  private exploredCountSubject = new BehaviorSubject<number>(0);

  // Observable al que otros componentes se suscriben.
  exploredCount$ = this.exploredCountSubject.asObservable();

  constructor() {}

  // Permite establecer el valor exacto del recuento
  setExploredCount(count: number): void {
    this.exploredCountSubject.next(count);
  }

  // Retorna el valor actual, si necesitas usarlo internamente.
  getExploredCount(): number {
    return this.exploredCountSubject.getValue();
  }

  // Si quisieras, podrías tener un método para incrementar de uno en uno
  incrementExploredCount(): void {
    const current = this.exploredCountSubject.getValue();
    this.exploredCountSubject.next(current + 1);
  }
}
