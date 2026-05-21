import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanosPetComponent } from './planos-pet.component';

describe('PlanosPetComponent', () => {
  let component: PlanosPetComponent;
  let fixture: ComponentFixture<PlanosPetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanosPetComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PlanosPetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
