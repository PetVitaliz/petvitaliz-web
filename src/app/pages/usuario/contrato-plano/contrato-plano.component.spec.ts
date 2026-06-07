import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContratoPlanoComponent } from './contrato-plano.component';

describe('ContratoPlanoComponent', () => {
  let component: ContratoPlanoComponent;
  let fixture: ComponentFixture<ContratoPlanoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContratoPlanoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ContratoPlanoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
