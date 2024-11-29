import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FourierSquareComponent } from './fourier-square.component';

describe('FourierSquareComponent', () => {
  let component: FourierSquareComponent;
  let fixture: ComponentFixture<FourierSquareComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FourierSquareComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FourierSquareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
