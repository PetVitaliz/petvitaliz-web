import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-consultas-agendadas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './consultas-agendadas.component.html',
  styleUrl: './consultas-agendadas.component.css'
})
export class ConsultasAgendadasComponent {

  filtroPet = '';
  filtroData = '';
  filtroStatus = 'Todos';

  paginaAtual = 1;
  itensPorPagina = 4;

  modalAberto = false;
  consultaSelecionada: any = null;

  consultas = [
    {
      id: 1,
      horario: '09:00',
      periodo: 'AM',
      pet: 'Thor',
      idade: '3 anos',
      tutor: 'Ricardo Alencar',
      motivo: 'Vacinação Anual',
      status: 'Confirmado'
    },
    {
      id: 2,
      horario: '10:30',
      periodo: 'AM',
      pet: 'Mel',
      idade: '2 anos',
      tutor: 'Carla Mendes',
      motivo: 'Consulta de rotina',
      status: 'Pendente'
    },
    {
      id: 3,
      horario: '13:00',
      periodo: 'PM',
      pet: 'Luna',
      idade: '5 anos',
      tutor: 'Amanda Rocha',
      motivo: 'Retorno clínico',
      status: 'Confirmado'
    },
    {
      id: 4,
      horario: '15:40',
      periodo: 'PM',
      pet: 'Bob',
      idade: '4 anos',
      tutor: 'Marcos Lima',
      motivo: 'Exame dermatológico',
      status: 'Cancelado'
    },
    {
      id: 5,
      horario: '17:00',
      periodo: 'PM',
      pet: 'Nina',
      idade: '1 ano',
      tutor: 'Fernanda Souza',
      motivo: 'Aplicação de vacina',
      status: 'Pendente'
    }
  ];

  get totalHoje() {
    return this.consultas.length;
  }

  get totalPendentes() {
    return this.consultas.filter(c => c.status === 'Pendente').length;
  }

  get consultasFiltradas() {
    const termo = this.filtroPet.toLowerCase().trim();

    return this.consultas.filter(consulta => {
      const petOk =
        consulta.pet.toLowerCase().includes(termo) ||
        consulta.tutor.toLowerCase().includes(termo) ||
        String(consulta.id).includes(termo);

      const statusOk =
        this.filtroStatus === 'Todos' || consulta.status === this.filtroStatus;

      return petOk && statusOk;
    });
  }

  get totalPaginas() {
    return Math.ceil(this.consultasFiltradas.length / this.itensPorPagina);
  }

  get consultasPaginadas() {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    const fim = inicio + this.itensPorPagina;

    return this.consultasFiltradas.slice(inicio, fim);
  }

  aplicarFiltros() {
    this.paginaAtual = 1;
  }

  limparFiltros() {
    this.filtroPet = '';
    this.filtroData = '';
    this.filtroStatus = 'Todos';
    this.paginaAtual = 1;
  }

  abrirDetalhes(consulta: any) {
    this.consultaSelecionada = { ...consulta };
    this.modalAberto = true;
  }

  fecharModal() {
    this.modalAberto = false;
    this.consultaSelecionada = null;
  }

  confirmarConsulta(consulta: any) {
    consulta.status = 'Confirmado';
  }

  cancelarConsulta(id: number) {
    const confirmar = confirm('Tem certeza que deseja cancelar esta consulta?');

    if (confirmar) {
      const consulta = this.consultas.find(c => c.id === id);

      if (consulta) {
        consulta.status = 'Cancelado';
      }
    }
  }

  excluirConsulta(id: number) {
    const confirmar = confirm('Tem certeza que deseja excluir esta consulta?');

    if (confirmar) {
      this.consultas = this.consultas.filter(c => c.id !== id);

      if (this.paginaAtual > this.totalPaginas) {
        this.paginaAtual = this.totalPaginas || 1;
      }
    }
  }

  reagendarConsulta(consulta: any) {
    this.consultaSelecionada = { ...consulta };
    this.modalAberto = true;
  }

  salvarAlteracoes() {
    const index = this.consultas.findIndex(c => c.id === this.consultaSelecionada.id);

    if (index !== -1) {
      this.consultas[index] = { ...this.consultaSelecionada };
    }

    this.fecharModal();
  }

  paginaAnterior() {
    if (this.paginaAtual > 1) {
      this.paginaAtual--;
    }
  }

  proximaPagina() {
    if (this.paginaAtual < this.totalPaginas) {
      this.paginaAtual++;
    }
  }
}