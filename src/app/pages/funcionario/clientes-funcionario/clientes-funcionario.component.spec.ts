import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientesFuncionarioComponent } from './clientes-funcionario.component';

describe('ClientesFuncionarioComponent', () => {
  let component: ClientesFuncionarioComponent;
  let fixture: ComponentFixture<ClientesFuncionarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientesFuncionarioComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ClientesFuncionarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
