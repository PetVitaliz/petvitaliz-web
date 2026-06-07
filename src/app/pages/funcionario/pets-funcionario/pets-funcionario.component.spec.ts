import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PetsFuncionarioComponent } from './pets-funcionario.component';

describe('PetsFuncionarioComponent', () => {
  let component: PetsFuncionarioComponent;
  let fixture: ComponentFixture<PetsFuncionarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PetsFuncionarioComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PetsFuncionarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
