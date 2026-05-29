import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultasAgendadasComponent } from './consultas-agendadas.component';

describe('ConsultasAgendadasComponent', () => {
  let component: ConsultasAgendadasComponent;
  let fixture: ComponentFixture<ConsultasAgendadasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultasAgendadasComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConsultasAgendadasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
