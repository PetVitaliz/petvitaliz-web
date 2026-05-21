import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConsultasService, ConsultaFuncionario } from '../../../core/services/consultas.service';

@Component({
  selector: 'app-consultas-funcionario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './consultas-funcionario.component.html',
  styleUrl: './consultas-funcionario.component.css'
})
export class ConsultasFuncionarioComponent {

  filtros = {
    pet: '',
    data: '',
    status: 'Todos os Status'
  };

  filtrosAplicados = {
    pet: '',
    data: '',
    status: 'Todos os Status'
  };

  paginaAtual = 1;
  itensPorPagina = 5;

  consultas: ConsultaFuncionario[] = [];

  consultaSelecionada: ConsultaFuncionario | null = null;
  modalDetalhesAberto = false;
  modalEdicaoAberto = false;

  consultaEditando: ConsultaFuncionario = this.criarConsultaVazia();

  constructor(private consultasService: ConsultasService) {
    this.consultas = this.consultasService.listarConsultas();
  }

  get consultasFiltradas() {
    return this.consultas.filter(c => {
      const pet = this.filtrosAplicados.pet.toLowerCase();
      const matchPet = !pet || c.pet.toLowerCase().includes(pet);

      const matchData = !this.filtrosAplicados.data || c.data === this.filtrosAplicados.data;

      const statusFiltro = this.filtrosAplicados.status.toUpperCase();

      const matchStatus =
        this.filtrosAplicados.status === 'Todos os Status' ||
        c.status === statusFiltro;

      return matchPet && matchData && matchStatus;
    });
  }

  get totalPaginas() {
    return Math.ceil(this.consultasFiltradas.length / this.itensPorPagina);
  }

  get paginas() {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  get consultasPaginadas() {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    return this.consultasFiltradas.slice(inicio, inicio + this.itensPorPagina);
  }

  aplicarFiltros(): void {
    this.filtrosAplicados = { ...this.filtros };
    this.paginaAtual = 1;
  }

  limparFiltros(): void {
    this.filtros = {
      pet: '',
      data: '',
      status: 'Todos os Status'
    };

    this.filtrosAplicados = { ...this.filtros };
    this.paginaAtual = 1;
  }

  mudarPagina(p: number): void {
    if (p < 1 || p > this.totalPaginas) return;
    this.paginaAtual = p;
  }

  selecionarConsulta(consulta: ConsultaFuncionario): void {
    this.consultaSelecionada = consulta;
  }

  abrirDetalhes(consulta: ConsultaFuncionario): void {
    this.consultaSelecionada = consulta;
    this.modalDetalhesAberto = true;
  }

  fecharDetalhes(): void {
    this.modalDetalhesAberto = false;
  }

  abrirEdicao(consulta: ConsultaFuncionario): void {
    this.consultaSelecionada = consulta;
    this.consultaEditando = { ...consulta };
    this.modalEdicaoAberto = true;
  }

  fecharEdicao(): void {
    this.modalEdicaoAberto = false;
  }

  salvarEdicao(): void {
    if (!this.consultaSelecionada) return;

    Object.assign(this.consultaSelecionada, {
      ...this.consultaEditando,
      tipo: this.consultasService.definirTipo(this.consultaEditando.status)
    });

    this.consultasService.salvarAlteracoes();
    this.fecharEdicao();
  }

  alterarStatus(consulta: ConsultaFuncionario, status: string): void {
    this.consultasService.atualizarStatus(consulta, status);
  }

  cancelarConsulta(consulta: ConsultaFuncionario): void {
    this.consultasService.atualizarStatus(consulta, 'CANCELADO');
  }

  finalizarConsulta(consulta: ConsultaFuncionario): void {
    this.consultasService.atualizarStatus(consulta, 'FINALIZADO');
  }

  excluirConsulta(consulta: ConsultaFuncionario): void {
    const confirmar = confirm(`Deseja excluir a consulta de ${consulta.pet}?`);

    if (!confirmar) return;

    this.consultasService.removerConsulta(consulta);
    this.consultas = this.consultasService.listarConsultas();
    this.consultaSelecionada = null;

    if (this.paginaAtual > this.totalPaginas) {
      this.paginaAtual = Math.max(this.totalPaginas, 1);
    }
  }

  private criarConsultaVazia(): ConsultaFuncionario {
    return {
      hora: '',
      horario: '',
      periodo: '',
      pet: '',
      idade: '',
      tutor: '',
      motivo: '',
      status: '',
      data: '',
      imagem: '',
      tipo: ''
    };
  }
}