import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderFuncionarioAuthComponent } from './header-funcionario-auth.component';

describe('HeaderFuncionarioAuthComponent', () => {
  let component: HeaderFuncionarioAuthComponent;
  let fixture: ComponentFixture<HeaderFuncionarioAuthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderFuncionarioAuthComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HeaderFuncionarioAuthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
