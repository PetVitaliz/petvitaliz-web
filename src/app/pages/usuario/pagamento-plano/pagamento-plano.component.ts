import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pagamento-plano',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.plano = JSON.parse(localStorage.getItem('planoSelecionado') || 'null');

    if (!this.plano) {
      this.router.navigate(['/usuario/planos-pet']);
    }
  }

  confirmarPagamento(): void {
    localStorage.setItem('pagamentoPlanoConfirmado', 'true');

    this.router.navigate(['/usuario/plano-sucesso']);
  }
}