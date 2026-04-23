import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EsqueciSenhaFuncionarioComponent } from './esqueci-senha-funcionario.component';

describe('EsqueciSenhaFuncionarioComponent', () => {
  let component: EsqueciSenhaFuncionarioComponent;
  let fixture: ComponentFixture<EsqueciSenhaFuncionarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EsqueciSenhaFuncionarioComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EsqueciSenhaFuncionarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
