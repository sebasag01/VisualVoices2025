import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css'],
})
export class CardComponent {
  @Input() word: string = '';
  @Input() explanation: string = '';
  @Output() wordClick = new EventEmitter<void>();
  @Output() repeatClick = new EventEmitter<void>();
  @Output() prevClick = new EventEmitter<void>();
  @Output() nextClick = new EventEmitter<void>();

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
}
