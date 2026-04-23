import { Component } from '@angular/core';
import { HeaderFuncionarioAuthComponent } from '../header-funcionario-auth/header-funcionario-auth.component';

@Component({
  selector: 'app-esqueci-senha-funcionario',
  standalone: true, // 👈 MUITO IMPORTANTE
  imports: [HeaderFuncionarioAuthComponent],
  templateUrl: './esqueci-senha-funcionario.component.html',
  styleUrl: './esqueci-senha-funcionario.component.css'
})
export class EsqueciSenhaFuncionarioComponent {}