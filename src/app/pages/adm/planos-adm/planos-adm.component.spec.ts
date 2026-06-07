import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanosAdmComponent } from './planos-adm.component';

describe('PlanosAdmComponent', () => {
  let component: PlanosAdmComponent;
  let fixture: ComponentFixture<PlanosAdmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanosAdmComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PlanosAdmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
