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

    const partesData = this.nascimento.trim().split('/');
    if (partesData.length !== 3) {
      this.erro = 'Insira uma data de nascimento válida no formato DD/MM/AAAA.';
      return;
    }

    const dia = parseInt(partesData[0], 10);
    const mes = parseInt(partesData[1], 10) - 1;
    const ano = parseInt(partesData[2], 10);

    const dataTeste = new Date(ano, mes, dia);
    const anoAtual = new Date().getFullYear();

    if (
      dataTeste.getFullYear() !== ano ||
      dataTeste.getMonth() !== mes ||
      dataTeste.getDate() !== dia ||
      ano < 1900 || 
      ano > anoAtual
    ) {
      this.erro = 'Data de nascimento inválida ou impossível.';
      return;
    }


    let generoFormatado = 'O'; 
    const generoLower = this.genero.toLowerCase().trim(); 

    if (generoLower === 'masculino' || generoLower === 'm') {
      generoFormatado = 'M';
    } else if (generoLower === 'feminino' || generoLower === 'f') {
      generoFormatado = 'F';
    } else if (generoLower === 'prefiro nao dizer' || generoLower === 'prefiro não dizer' || generoLower === 'outro' || generoLower === 'o') {
      generoFormatado = 'O';
    }

    let dataFormatada = this.nascimento.trim();

    if (dataFormatada.includes('/')) {
      const partes = dataFormatada.split('/'); 
      if (partes.length === 3) {
        const dia = partes[0].padStart(2, '0');
        const mes = partes[1].padStart(2, '0');
        const ano = partes[2];
        dataFormatada = `${ano}-${mes}-${dia}`;
      }
    }
    const dataFinalISO = `${dataFormatada}T00:00:00.000Z`;

    const dadosFormulario = {
      nome: this.nome.trim(),
      sobrenome: this.sobrenome.trim(),
      CPF: this.cpf.trim(), 
      data_nascimento: dataFinalISO, 
      telefone: this.telefone.trim(),
      genero: generoFormatado, 
      email: this.email.trim().toLowerCase(),
      senha: this.senha
    };

    this.http.post(`${environment.apiUrl}/user/cadastro`, dadosFormulario, {
      withCredentials: true
    })
    .subscribe({
      next: (response: any) => {
        this.sucesso = response.mensagem || 'Cadastro realizado com sucesso';
        
        setTimeout(() => {
          this.router.navigate(['/login']); 
        }, 2500);
      },
      error: (err) => {
        console.error("Erro no fluxo de cadastro:", err);

        if (err.error) {
          this.erro = err.error.mensagem || err.error.message;
        } 
        
        if (!this.erro && typeof err.error === 'string') {
          this.erro = err.error;
        } 
        
        if (!this.erro) {
          this.erro = 'Erro interno ao conectar com o servidor.';
        }
      }
    });
  }
}