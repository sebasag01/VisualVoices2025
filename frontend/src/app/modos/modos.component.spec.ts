import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModosComponent } from './modos.component';

describe('ModosComponent', () => {
  let component: ModosComponent;
  let fixture: ComponentFixture<ModosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
