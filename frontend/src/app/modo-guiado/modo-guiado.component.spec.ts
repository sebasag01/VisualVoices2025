import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModoGuiadoComponent } from './modo-guiado.component';

describe('ModoGuiadoComponent', () => {
  let component: ModoGuiadoComponent;
  let fixture: ComponentFixture<ModoGuiadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModoGuiadoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModoGuiadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
