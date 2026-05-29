import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarCadastroPetComponent } from './listar-cadastro-pet.component';

describe('ListarCadastroPetComponent', () => {
  let component: ListarCadastroPetComponent;
  let fixture: ComponentFixture<ListarCadastroPetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListarCadastroPetComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ListarCadastroPetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
