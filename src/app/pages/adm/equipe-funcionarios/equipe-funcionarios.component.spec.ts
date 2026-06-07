import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EquipeFuncionariosComponent } from './equipe-funcionarios.component';

describe('EquipeFuncionariosComponent', () => {
  let component: EquipeFuncionariosComponent;
  let fixture: ComponentFixture<EquipeFuncionariosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EquipeFuncionariosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EquipeFuncionariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
