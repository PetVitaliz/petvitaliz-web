import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-home-adm',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home-adm.component.html',
  styleUrl: './home-adm.component.css'
})
export class HomeAdmComponent {
  modalLogsAberto = false;

  constructor(private router: Router) {}

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
      nome: 'Cuidados Essenciais',
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
    { id: 1, nome: 'Ana Souza', email: 'ana.souza@petvitaliz.com', cargo: 'TI / Infra', inicial: 'AS', ultimo: 'Hoje, 09:15' },
    { id: 2, nome: 'Marcos Lima', email: 'marcos@petvitaliz.com', cargo: 'Gerente Geral', inicial: 'ML', ultimo: 'Ontem, 18:40' },
    { id: 3, nome: 'Marcos Lima', email: 'marcos.l@petvitaliz.com', cargo: 'Gerente Geral', inicial: 'ML', ultimo: 'Ontem, 18:40' }
  ];

  equipeResumo = [
    { titulo: 'Total de Funcionários', valor: '6', detalhe: '', status: '' },
    { titulo: 'Veterinários', valor: '2', detalhe: '', status: 'Ativos' },
    { titulo: 'Equipe de Apoio', valor: '3', detalhe: '', status: 'Ativos' }
  ];

  logs = [
    { tipo: 'Administrador', nome: 'Ana Souza', acao: 'Acessou o painel administrativo', horario: 'Hoje, 09:42' },
    { tipo: 'Administrador', nome: 'Marcos Lima', acao: 'Atualizou permissões de acesso', horario: 'Hoje, 08:55' },
    { tipo: 'Funcionário', nome: 'Dr. Rogério Souza', acao: 'Finalizou uma consulta', horario: 'Ontem, 18:20' },
    { tipo: 'Funcionário', nome: 'Dra. Carla Mendes', acao: 'Confirmou uma vacinação', horario: 'Ontem, 16:10' }
  ];

  abrirListarAdmin(): void {
    this.router.navigate(['/adm/listar-admin']);
  }

  abrirModalLogs(event?: Event): void {
    event?.stopPropagation();
    this.modalLogsAberto = true;
  }

  fecharModalLogs(): void {
    this.modalLogsAberto = false;
  }
}