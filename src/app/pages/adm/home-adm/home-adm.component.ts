import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home-adm',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home-adm.component.html',
  styleUrl: './home-adm.component.css'
})
export class HomeAdmComponent {

  planos = [
    {
      tipo: 'BÁSICO',
      nome: 'Plano Inicial',
      preco: 'R$1,00',
      beneficios: ['Basic Care', 'Vacinas Anuais', 'Suporte via Chat'],
      rota: '/adm/planos'
    },
    {
      tipo: 'POPULAR',
      nome: 'Cuidado Essenciais',
      preco: 'R$2,00',
      beneficios: ['Tudo do Inicial', 'Consultas Ilimitadas', 'Exames de Sangue'],
      rota: '/adm/planos'
    },
    {
      tipo: 'MAIS COMPLETO',
      nome: 'Plano Abrangente',
      preco: 'R$3,00',
      beneficios: ['Tudo do Essencial', 'Hospitalização 24h', 'Especialistas Gratuitos', 'Limpeza de Tártaro'],
      rota: '/adm/planos',
      destaque: true
    },
    {
      tipo: 'VIP',
      nome: 'Saúde Premium',
      preco: 'R$4,00',
      beneficios: ['Cobertura Total', 'Pet Concierge 24/7', 'Banho e Tosa Incluso', 'Seguro Viagem Pet'],
      rota: '/adm/planos'
    }
  ];

  administradores = [
    { nome: 'Ana Souza', email: 'ana.souza@petvitaliz.com', cargo: 'TI / Infra', inicial: 'AS', ultimo: 'Hoje, 09:15' },
    { nome: 'Marcos Lima', email: 'marcos@petvitaliz.com', cargo: 'Gerente Geral', inicial: 'ML', ultimo: 'Ontem, 18:40' },
    { nome: 'Marcos Lima', email: 'marcos.l@petvitaliz.com', cargo: 'Gerente Geral', inicial: 'ML', ultimo: 'Ontem, 18:40' }
  ];

  encaixarEmergencia() {
    alert('Emergência encaixada na agenda!');
  }

  verLogs() {
    alert('Abrindo logs completos do sistema...');
  }

}