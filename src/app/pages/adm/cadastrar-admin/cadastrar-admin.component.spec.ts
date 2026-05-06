import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadastrarAdminComponent } from './cadastrar-admin.component';

describe('CadastrarAdminComponent', () => {
  let component: CadastrarAdminComponent;
  let fixture: ComponentFixture<CadastrarAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadastrarAdminComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CadastrarAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
