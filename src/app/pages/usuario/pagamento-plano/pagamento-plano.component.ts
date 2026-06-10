import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { DataMaskDirective } from './data-mask.directive';

@Component({
  selector: 'app-pagamento-plano',
  standalone: true,
  imports: [CommonModule, FormsModule, DataMaskDirective],
  templateUrl: './pagamento-plano.component.html',
  styleUrl: './pagamento-plano.component.css'
})
export class PagamentoPlanoComponent implements OnInit {
  plano: any = null;

  nomeCompleto = '';
  cpf = '';
  email = '';
  numeroCartao = '';
  validade = '';
  cvv = '';
  nomeCartao = '';

  erroMensagem = '';
  carregando = false;

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    this.plano = JSON.parse(localStorage.getItem('planoSelecionado') || 'null');
    if (!this.plano) {
      this.router.navigate(['/usuario/planos-pet']);
      return;
    }
    this.carregarDadosUsuario();
  }

  private obterErroCpf(cpf: string): string | null {
    const numeros = cpf.replace(/\D/g, '').trim();
    if (numeros.length !== 11) return 'CPF incompleto.';
    if (/^(\d)\1{10}$/.test(numeros)) return 'Este CPF é inválido.';
    
    let soma = 0; let resto;
    for (let i = 1; i <= 9; i++) soma += parseInt(numeros.substring(i - 1, i), 10) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(numeros.substring(9, 10), 10)) return 'Este CPF é inválido.';

    soma = 0;
    for (let i = 1; i <= 10; i++) soma += parseInt(numeros.substring(i - 1, i), 10) * (12 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(numeros.substring(10, 11), 10)) return 'Este CPF é inválido.';

    return null;
  }

  confirmarPagamento(): void {
    this.erroMensagem = '';

    if (!this.nomeCompleto || !this.cpf || !this.email || !this.numeroCartao || !this.validade || !this.cvv || !this.nomeCartao) {
      this.erroMensagem = 'Por favor, preencha todas as informações de dados pessoais e pagamento.';
      return;
    }

    const erroCpfEncontrado = this.obterErroCpf(this.cpf);
    if (erroCpfEncontrado) {
      this.erroMensagem = erroCpfEncontrado;
      return;
    }

    localStorage.setItem('pagamentoPlanoConfirmado', 'true');
    this.router.navigate(['/user/contrato-plano']);
  }

  carregarDadosUsuario(): void {
    this.http.get<any>(`${environment.apiUrl}/user/buscar/perfil`, { withCredentials: true }).subscribe({
      next: (user) => {
        this.nomeCompleto = `${user.nome} ${user.sobrenome}`;
        this.email = user.email;

        if (user.CPF) {
          let cpfLimpo = user.CPF.replace(/\D/g, '');
          this.cpf = this.formatarCpf(cpfLimpo);
        }
      },
      error: (err) => console.error('Erro ao carregar perfil', err)
    });
  }

  private formatarCpf(v: string): string {
    if (v.length !== 11) return v;
    return v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
}