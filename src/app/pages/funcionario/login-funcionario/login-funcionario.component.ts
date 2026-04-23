import { Component } from '@angular/core';
import { HeaderFuncionarioAuthComponent } from '../header-funcionario-auth/header-funcionario-auth.component';

@Component({
  selector: 'app-login-funcionario',
  standalone: true, // 👈 ESSA LINHA FALTAVA
  imports: [HeaderFuncionarioAuthComponent],
  templateUrl: './login-funcionario.component.html',
  styleUrl: './login-funcionario.component.css'
})
export class LoginFuncionarioComponent {}