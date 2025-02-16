import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css'],
  imports: [CommonModule]

})
export class CardComponent {
  @Input() word: string = '';
  @Input() explanation: string = '';
  @Input() nextLabel: string = 'Siguiente';
  @Input() showWelcome: boolean = false;
  @Input() levelNumber: number = 1;
  @Input() showChooseLevel = false; 
  @Input() availableLevels: number[] = [];

  @Output() wordClick = new EventEmitter<void>();
  @Output() repeatClick = new EventEmitter<void>();
  @Output() prevClick = new EventEmitter<void>();
  @Output() nextClick = new EventEmitter<void>();
  @Output() continueClicked = new EventEmitter<void>();
  @Output() startOverClicked = new EventEmitter<void>();
  @Output() chooseLevelClicked = new EventEmitter<void>();
  @Output() levelSelected = new EventEmitter<number>();

  isLeaving = false;

  onWordButtonClick() {
    this.wordClick.emit();
  }

  onRepeatButtonClick() {
    this.repeatClick.emit();
  }

  prevCard() {
    this.isLeaving = true;
    this.prevClick.emit();
  }

  nextCard() {
    this.isLeaving = true;
    this.nextClick.emit();
  }

  onAnimationEnd() {
    if (this.isLeaving) {
      this.isLeaving = false;
    }
  }

  onLevelSelect(lvl: number) {
    this.levelSelected.emit(lvl);
  }
  
}
