import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http'; 
import { environment } from '../../../environments/environment';
import { DataMaskDirective } from './data-mask.directive';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DataMaskDirective],
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
  sucesso = '';

  constructor(private router: Router, private http: HttpClient) {}

  cadastrar() {
    this.erro = '';
    this.sucesso = '';

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

    let generoFormatado = 'O'; 
    const generoLower = this.genero.toLowerCase().trim(); 
    if (generoLower === 'masculino' || generoLower === 'm') generoFormatado = 'M';
    else if (generoLower === 'feminino' || generoLower === 'f') generoFormatado = 'F';

    let dataFormatada = this.nascimento.trim();
    if (dataFormatada.includes('/')) {
      const partes = dataFormatada.split('/'); 
      if (partes.length === 3) {
        dataFormatada = `${partes[2]}-${partes[1]}-${partes[0]}`;
      }
    }
    const dataFinalISO = `${dataFormatada}T00:00:00.000Z`;

    const dadosFormulario = {
      nome: this.nome,
      sobrenome: this.sobrenome,
      CPF: this.cpf.trim(), 
      data_nascimento: dataFinalISO, 
      telefone: this.telefone,
      genero: generoFormatado, 
      email: this.email.trim(),
      senha: this.senha
    };

    this.http.post(`${environment.apiUrl}/user/cadastro`, dadosFormulario, {
      withCredentials: true
    })
    .subscribe({
      next: (response: any) => {
        this.sucesso = response.mensagem || 'Cadastro realizado com sucesso. Redirecionando... 🐾';
        
        setTimeout(() => {
          this.router.navigate(['/user/login']);
        }, 2500);
      },
      error: (err) => {
        console.error("Objeto de erro completo no Angular:", err);
        if (err.error && err.error.mensagem) {
          this.erro = err.error.mensagem;
        } else if (err.error && typeof err.error === 'string') {
          this.erro = err.error;
        } else {
          this.erro = err.message || 'Erro interno ao conectar com o servidor.';
        }
      }
    });
  }
}