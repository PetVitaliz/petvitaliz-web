import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadastroPetComponent } from './cadastro-pet.component';

describe('CadastroPetComponent', () => {
  let component: CadastroPetComponent;
  let fixture: ComponentFixture<CadastroPetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadastroPetComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CadastroPetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
