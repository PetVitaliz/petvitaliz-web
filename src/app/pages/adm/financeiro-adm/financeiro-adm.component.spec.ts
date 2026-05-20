import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinanceiroAdmComponent } from './financeiro-adm.component';

describe('FinanceiroAdmComponent', () => {
  let component: FinanceiroAdmComponent;
  let fixture: ComponentFixture<FinanceiroAdmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinanceiroAdmComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FinanceiroAdmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
