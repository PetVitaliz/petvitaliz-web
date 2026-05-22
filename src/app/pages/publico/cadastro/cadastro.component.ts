import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './cadastro.component.html',
  styleUrl: './cadastro.component.css'
})
export class CadastroComponent {

  nome = '';
  sobrenome = '';
  cpf = '';
  nascimento = '';
  telefone = '';
  genero = '';
  email = '';
  senha = '';

  senhaVisivel = false;
  erro = '';

  constructor(private router: Router) {}

  get forcaSenha(): string {
    if (!this.senha) {
      return '';
    }

    let pontos = 0;

    if (this.senha.length >= 6) pontos++;
    if (this.senha.length >= 8) pontos++;
    if (/[A-Z]/.test(this.senha)) pontos++;
    if (/[0-9]/.test(this.senha)) pontos++;
    if (/[^A-Za-z0-9]/.test(this.senha)) pontos++;

    if (pontos <= 2) {
      return 'fraca';
    }

    if (pontos <= 4) {
      return 'media';
    }

    return 'forte';
  }

  get textoForcaSenha(): string {
    if (!this.senha) {
      return '';
    }

    if (this.forcaSenha === 'fraca') {
      return 'Segurança fraca';
    }

    if (this.forcaSenha === 'media') {
      return 'Segurança média';
    }

    return 'Segurança alta';
  }

  cadastrar(): void {
    this.erro = '';

    if (
      !this.nome ||
      !this.sobrenome ||
      !this.cpf ||
      !this.nascimento ||
      !this.telefone ||
      !this.genero ||
      !this.email ||
      !this.senha
    ) {
      this.erro = 'Preencha todos os campos.';
      return;
    }

    localStorage.setItem('usuarioCadastro', JSON.stringify({
      nome: this.nome,
      sobrenome: this.sobrenome,
      cpf: this.cpf,
      nascimento: this.nascimento,
      telefone: this.telefone,
      genero: this.genero,
      email: this.email,
      senha: this.senha,
      tipo: 'usuario'
    }));

    alert('Cadastro realizado com sucesso!');
    this.router.navigate(['/usuario/login']);
  }

}