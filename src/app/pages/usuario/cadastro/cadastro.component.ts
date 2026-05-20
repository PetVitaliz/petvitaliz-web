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

  cadastrar() {
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