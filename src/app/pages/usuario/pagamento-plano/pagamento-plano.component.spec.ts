import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagamentoPlanoComponent } from './pagamento-plano.component';

describe('PagamentoPlanoComponent', () => {
  let component: PagamentoPlanoComponent;
  let fixture: ComponentFixture<PagamentoPlanoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PagamentoPlanoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PagamentoPlanoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
