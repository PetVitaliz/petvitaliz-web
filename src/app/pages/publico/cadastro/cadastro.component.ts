import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.prod';
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
    if (!this.senha) return '';
    let pontos = 0;
    if (this.senha.length >= 6) pontos++;
    if (this.senha.length >= 8) pontos++;
    if (/[A-Z]/.test(this.senha)) pontos++;
    if (/[0-9]/.test(this.senha)) pontos++;
    if (/[^A-Za-z0-9]/.test(this.senha)) pontos++;

    if (pontos <= 2) return 'fraca';
    if (pontos <= 4) return 'media';
    return 'forte';
  }

  get textoForcaSenha(): string {
    if (!this.senha) return '';
    if (this.forcaSenha === 'fraca') return 'Segurança fraca';
    if (this.forcaSenha === 'media') return 'Segurança média';
    return 'Segurança alta';
  }

  alternarSenha(): void {
    this.senhaVisivel = !this.senhaVisivel;
  }

  formatarTelefone(): void {
    const numeros = this.telefone.replace(/\D/g, '').slice(0, 11);
    if (numeros.length <= 10) {
      this.telefone = numeros.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2');
      return;
    }
    this.telefone = numeros.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
  }

  formatarNascimento(): void {
    this.nascimento = this.nascimento
      .replace(/\D/g, '')
      .slice(0, 8)
      .replace(/(\d{2})(\d)/, '$1/$2')
      .replace(/(\d{2})(\d)/, '$1/$2');
  }

  private limparNumeros(valor: string): string {
    return valor ? valor.replace(/\D/g, '') : '';
  }

  formatarCpf(): void {
    let valor = this.cpf.replace(/\D/g, '');

    if (valor.length > 11) {
      valor = valor.slice(0, 11);
    }

    if (valor.length <= 3) {
      this.cpf = valor;
    } else if (valor.length <= 6) {
      this.cpf = valor.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    } else if (valor.length <= 9) {
      this.cpf = valor.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    } else {
      this.cpf = valor.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
    }
  }

  private validarCpf(cpf: string): boolean {
    const numeros = cpf.replace(/\D/g, '').trim();

    if (numeros.length !== 11) {
      return false;
    }

    if (/^(\d)\1{10}$/.test(numeros)) {
      return false;
    }

    let soma = 0;
    let resto;

    for (let i = 1; i <= 9; i++) {
      soma = soma + parseInt(numeros.substring(i - 1, i), 10) * (11 - i);
    }
    resto = (soma * 10) % 11;

    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(numeros.substring(9, 10), 10)) return false;

    soma = 0;
    for (let i = 1; i <= 10; i++) {
      soma = soma + parseInt(numeros.substring(i - 1, i), 10) * (12 - i);
    }
    resto = (soma * 10) % 11;

    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(numeros.substring(10, 11), 10)) return false;

    return true;
  }

  private validarTelefone(telefone: string): boolean {
    const numeros = this.limparNumeros(telefone);
    return numeros.length === 10 || numeros.length === 11;
  }

  private converterNascimentoParaISO(): string | null {
    const partesData = this.nascimento.trim().split('/');

    if (partesData.length !== 3) return null;

    const dia = parseInt(partesData[0], 10);
    const mes = parseInt(partesData[1], 10);
    const ano = parseInt(partesData[2], 10);

    const dataTeste = new Date(ano, mes - 1, dia);
    const anoAtual = new Date().getFullYear();

    if (
      dataTeste.getFullYear() !== ano ||
      dataTeste.getMonth() !== mes - 1 ||
      dataTeste.getDate() !== dia ||
      ano < 1900 ||
      ano > anoAtual
    ) {
      return null;
    }

    const diaFormatado = String(dia).padStart(2, '0');
    const mesFormatado = String(mes).padStart(2, '0');

    return `${ano}-${mesFormatado}-${diaFormatado}T00:00:00.000Z`;
  }

  private formatarGenero(): string {
    const generoLower = this.genero.toLowerCase().trim();
    if (generoLower === 'masculino' || generoLower === 'm') return 'M';
    if (generoLower === 'feminino' || generoLower === 'f') return 'F';
    return 'O';
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

    if (!this.validarCpf(this.cpf)) {
      this.erro = 'CPF inválido. Use o formato 000.000.000-00.';
      return;
    }

    if (!this.validarTelefone(this.telefone)) {
      this.erro = 'Telefone inválido. Use o formato (00) 00000-0000.';
      return;
    }

    const dataFinalISO = this.converterNascimentoParaISO();

    if (!dataFinalISO) {
      this.erro = 'Insira uma data de nascimento válida no formato DD/MM/AAAA.';
      return;
    }

    const dadosFormulario = {
      nome: this.nome.trim(),
      sobrenome: this.sobrenome.trim(),
      CPF: this.limparNumeros(this.cpf),
      data_nascimento: dataFinalISO,
      telefone: this.limparNumeros(this.telefone),
      genero: this.formatarGenero(),
      email: this.email.trim().toLowerCase(),
      senha: this.senha
    };

    this.http.post(`${environment.apiUrl}/user/cadastro`, dadosFormulario, {
      withCredentials: true
    }).subscribe({
      next: (response: any) => {
        this.sucesso = response.mensagem || 'Cadastro realizado com sucesso';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2500);
      },
      error: (err) => {
        console.error('Erro no fluxo de cadastro:', err);
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
