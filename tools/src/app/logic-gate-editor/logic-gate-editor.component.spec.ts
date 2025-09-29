import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogicGateEditorComponent } from './logic-gate-editor.component';

describe('LogicGateEditorComponent', () => {
  let component: LogicGateEditorComponent;
  let fixture: ComponentFixture<LogicGateEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogicGateEditorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LogicGateEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
