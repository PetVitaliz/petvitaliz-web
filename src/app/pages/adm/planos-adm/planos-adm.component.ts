import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-planos-adm',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './planos-adm.component.html',
  styleUrl: './planos-adm.component.css'
})
export class PlanosAdmComponent {

  modalAberto = false;
  modalDetalhesAberto = false;
  modoEdicao = false;
  planoSelecionado: any = null;
  planoDetalhes: any = null;

  planos = [
    {
      id: 1,
      tag: 'NÍVEL DE ENTRADA',
      nome: 'Plano Inicial',
      preco: '1,00',
      status: 'Ativo',
      detalhes: 'Plano básico para primeiros atendimentos e acompanhamento simples.',
      beneficios: ['Atendimento básico', 'Histórico do pet', 'Suporte administrativo']
    },
    {
      id: 2,
      tag: 'ESCOLHA POPULAR',
      nome: 'Cuidados Essenciais',
      preco: '2,00',
      status: 'Ativo',
      detalhes: 'Plano intermediário com benefícios essenciais para pets.',
      beneficios: ['Consultas essenciais', 'Acompanhamento mensal', 'Controle de vacinas']
    },
    {
      id: 3,
      tag: 'RECOMENDADO',
      nome: 'Plano Abrangente',
      preco: '3,00',
      status: 'Ativo',
      detalhes: 'Plano completo para acompanhamento frequente.',
      beneficios: ['Atendimento completo', 'Prioridade em consultas', 'Relatórios periódicos']
    },
    {
      id: 4,
      tag: 'NÍVEL ELITE',
      nome: 'Saúde Premium',
      preco: '4,00',
      status: 'Ativo',
      detalhes: 'Plano premium com prioridade e cobertura ampliada.',
      beneficios: ['Prioridade total', 'Cobertura ampliada', 'Acompanhamento personalizado']
    }
  ];

  novoPlano() {
    this.modoEdicao = false;
    this.planoSelecionado = {
      id: Date.now(),
      tag: '',
      nome: '',
      preco: '',
      status: 'Ativo',
      detalhes: '',
      beneficios: []
    };
    this.modalAberto = true;
  }

  editarPlano(plano: any) {
    this.modoEdicao = true;
    this.planoSelecionado = { ...plano };
    this.modalAberto = true;
  }

  salvarPlano() {
    if (!this.planoSelecionado.nome || !this.planoSelecionado.preco || !this.planoSelecionado.tag) {
      alert('Preencha os campos obrigatórios.');
      return;
    }

    if (this.modoEdicao) {
      const index = this.planos.findIndex(p => p.id === this.planoSelecionado.id);

      if (index !== -1) {
        this.planos[index] = { ...this.planoSelecionado };
      }
    } else {
      this.planos.push({ ...this.planoSelecionado });
    }

    this.fecharModal();
  }

  excluirPlano(id: number) {
    const confirmar = confirm('Tem certeza que deseja excluir este plano?');

    if (confirmar) {
      this.planos = this.planos.filter(plano => plano.id !== id);
    }
  }

  verDetalhes(plano: any) {
    this.planoDetalhes = plano;
    this.modalDetalhesAberto = true;
  }

  fecharDetalhes() {
    this.modalDetalhesAberto = false;
    this.planoDetalhes = null;
  }

  fecharModal() {
    this.modalAberto = false;
    this.planoSelecionado = null;
    this.modoEdicao = false;
  }
}