import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanoSucessoComponent } from './plano-sucesso.component';

describe('PlanoSucessoComponent', () => {
  let component: PlanoSucessoComponent;
  let fixture: ComponentFixture<PlanoSucessoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanoSucessoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PlanoSucessoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
