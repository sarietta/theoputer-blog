import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WireLabelEditorComponent } from './wire-label-editor.component';

describe('WireLabelEditorComponent', () => {
  let component: WireLabelEditorComponent;
  let fixture: ComponentFixture<WireLabelEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WireLabelEditorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WireLabelEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
