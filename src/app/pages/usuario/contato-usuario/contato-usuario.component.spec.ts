import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContatoUsuarioComponent } from './contato-usuario.component';

describe('ContatoUsuarioComponent', () => {
  let component: ContatoUsuarioComponent;
  let fixture: ComponentFixture<ContatoUsuarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContatoUsuarioComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ContatoUsuarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
