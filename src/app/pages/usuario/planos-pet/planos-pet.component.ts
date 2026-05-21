import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-planos-pet',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './planos-pet.component.html',
  styleUrl: './planos-pet.component.css'
})
export class PlanosPetComponent {

  planoSelecionado: any = null;

  planos = [
    {
      tag: 'BÁSICO',
      nome: 'Plano Inicial',
      preco: 'R$1,00',
      destaque: false,
      recomendado: false,
      descricao:
        'Ideal para quem quer começar a cuidar melhor do pet.',

      beneficios: [
        'Basic Care',
        'Vacinas anuais',
        'Suporte via chat'
      ],

      detalhes: [
        'Acompanhamento básico do pet',
        'Histórico de consultas',
        'Notificações importantes',
        'Suporte pelo chat'
      ]
    },

    {
      tag: 'POPULAR',
      nome: 'Cuidados Essenciais',
      preco: 'R$2,00',
      destaque: false,
      recomendado: false,
      descricao:
        'Plano equilibrado para rotina preventiva.',

      beneficios: [
        'Tudo do inicial',
        'Consultas ilimitadas',
        'Exames de sangue'
      ],

      detalhes: [
        'Consultas ilimitadas',
        'Controle de vacinas',
        'Exames laboratoriais',
        'Suporte prioritário'
      ]
    },

    {
      tag: 'MAIS COMPLETO',
      nome: 'Plano Abrangente',
      preco: 'R$3,00',
      destaque: true,
      recomendado: true,
      descricao:
        'A melhor escolha para acompanhamento completo.',

      beneficios: [
        'Tudo do Essencial',
        'Hospitalização 24h',
        'Especialistas gratuitos',
        'Limpeza de tártaro'
      ],

      detalhes: [
        'Hospitalização 24h',
        'Especialistas veterinários',
        'Limpeza de tártaro',
        'Atendimento prioritário',
        'Suporte avançado'
      ]
    },

    {
      tag: 'VIP',
      nome: 'Saúde Premium',
      preco: 'R$4,00',
      destaque: false,
      recomendado: false,
      descricao:
        'Plano premium para pets que precisam de atenção total.',

      beneficios: [
        'Cobertura total',
        'Pet concierge 24/7',
        'Banho e tosa incluso',
        'Seguro viagem pet'
      ],

      detalhes: [
        'Cobertura total',
        'Seguro viagem',
        'Banho e tosa',
        'Atendimento VIP',
        'Acompanhamento completo'
      ]
    }
  ];

  constructor(private router: Router) {}

  abrirDetalhes(plano: any): void {
    this.planoSelecionado = plano;
  }

  fecharDetalhes(): void {
    this.planoSelecionado = null;
  }

  concluirPlano(): void {
    if (!this.planoSelecionado) return;

    localStorage.setItem(
      'planoSelecionado',
      JSON.stringify(this.planoSelecionado)
    );

    this.router.navigate(['/pagamento-plano']);
  }
}