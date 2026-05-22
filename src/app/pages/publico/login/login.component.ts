import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  email = '';
  senha = '';

  erro = '';

  lembrar = false;
  senhaVisivel = false;

  constructor(private router: Router) {}

  entrar() {
    this.erro = '';

    if (!this.email || !this.senha) {
      this.erro = 'Preencha e-mail e senha.';
      return;
    }

    const emailDigitado = this.email.trim().toLowerCase();
    const senhaDigitada = this.senha.trim();

    if (
      emailDigitado === 'admin@petvitaliz.com' &&
      senhaDigitada === 'admin123'
    ) {
      localStorage.setItem('usuarioLogado', JSON.stringify({
        nome: 'Dr. Ricardo Silva',
        email: emailDigitado,
        tipo: 'admin'
      }));

      this.router.navigate(['/adm/home']);
      return;
    }

    if (
      emailDigitado === 'funcionario@petvitaliz.com' &&
      senhaDigitada === 'func123'
    ) {
      localStorage.setItem('usuarioLogado', JSON.stringify({
        nome: 'Funcionário PetVitaliz',
        email: emailDigitado,
        tipo: 'funcionario'
      }));

      this.router.navigate(['/funcionario/home']);
      return;
    }

    const usuarioSalvo = localStorage.getItem('usuarioCadastro');

    if (usuarioSalvo) {
      const usuario = JSON.parse(usuarioSalvo);

      if (
        usuario.email?.toLowerCase() === emailDigitado &&
        usuario.senha === senhaDigitada
      ) {
        localStorage.setItem('usuarioLogado', JSON.stringify({
          nome: `${usuario.nome} ${usuario.sobrenome}`,
          email: usuario.email,
          tipo: 'usuario'
        }));

        this.router.navigate(['/home']);
        return;
      }
    }

    this.erro = 'E-mail ou senha inválidos.';
  }

}