import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultasAdmComponent } from './consultas-adm.component';

describe('ConsultasAdmComponent', () => {
  let component: ConsultasAdmComponent;
  let fixture: ComponentFixture<ConsultasAdmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultasAdmComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConsultasAdmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
