import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-reset-senha',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reset-senha.component.html',
  styleUrl: './reset-senha.component.css'
})
export class ResetSenhaComponent {
  senha = '';
  confirmarSenha = '';

  senhaVisivel = false;
  confirmarVisivel = false;

  erro = '';
  sucesso = '';

  constructor(private router: Router) {}

  redefinirSenha() {
    this.erro = '';
    this.sucesso = '';

    if (!this.senha || !this.confirmarSenha) {
      this.erro = 'Preencha todos os campos.';
      return;
    }

    if (this.senha.length < 6) {
      this.erro = 'A senha precisa ter pelo menos 6 caracteres.';
      return;
    }

    if (this.senha !== this.confirmarSenha) {
      this.erro = 'As senhas não conferem.';
      return;
    }

    const usuarioSalvo = localStorage.getItem('usuarioCadastro');

    if (usuarioSalvo) {
      const usuario = JSON.parse(usuarioSalvo);
      usuario.senha = this.senha;

      localStorage.setItem('usuarioCadastro', JSON.stringify(usuario));
    }

    this.sucesso = 'Senha redefinida com sucesso!';

    setTimeout(() => {
      this.router.navigate(['/usuario/login']);
    }, 1200);
  }
}