import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModoLibreComponent } from './modo-libre.component';

describe('ModoLibreComponent', () => {
  let component: ModoLibreComponent;
  let fixture: ComponentFixture<ModoLibreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModoLibreComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModoLibreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
