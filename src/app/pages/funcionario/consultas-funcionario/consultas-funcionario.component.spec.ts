import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultasFuncionarioComponent } from './consultas-funcionario.component';

describe('ConsultasFuncionarioComponent', () => {
  let component: ConsultasFuncionarioComponent;
  let fixture: ComponentFixture<ConsultasFuncionarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultasFuncionarioComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConsultasFuncionarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
