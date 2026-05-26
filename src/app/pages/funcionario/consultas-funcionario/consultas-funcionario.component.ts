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
  modalNovaConsultaAberto = false;

  consultaEditando: ConsultaFuncionario = this.criarConsultaVazia();

  novaConsulta = {
    hora: '',
    periodo: 'AM',
    pet: '',
    idade: '',
    tutor: '',
    tipoAtendimento: 'Consulta de rotina',
    data: ''
  };

  constructor(private consultasService: ConsultasService) {
    this.consultas = this.consultasService.listarConsultas();
  }

  get consultasFiltradas(): ConsultaFuncionario[] {
    return this.consultas.filter(consulta => {
      const pet = this.filtrosAplicados.pet.trim().toLowerCase();

      const matchPet =
        !pet ||
        consulta.pet.toLowerCase().includes(pet);

      const matchData =
        !this.filtrosAplicados.data ||
        consulta.data === this.filtrosAplicados.data;

      const statusFiltro = this.normalizarStatus(this.filtrosAplicados.status);

      const matchStatus =
        this.filtrosAplicados.status === 'Todos os Status' ||
        consulta.status === statusFiltro;

      return matchPet && matchData && matchStatus;
    });
  }

  get totalPaginas(): number {
    return Math.max(Math.ceil(this.consultasFiltradas.length / this.itensPorPagina), 1);
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  get consultasPaginadas(): ConsultaFuncionario[] {
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

  mudarPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.paginaAtual = pagina;
  }

  abrirNovaConsulta(): void {
    this.novaConsulta = {
      hora: '',
      periodo: 'AM',
      pet: '',
      idade: '',
      tutor: '',
      tipoAtendimento: 'Consulta de rotina',
      data: this.pegarDataHoje()
    };

    this.modalNovaConsultaAberto = true;
  }

  fecharNovaConsulta(): void {
    this.modalNovaConsultaAberto = false;
  }

  salvarNovaConsulta(): void {
    if (
      !this.novaConsulta.hora ||
      !this.novaConsulta.pet ||
      !this.novaConsulta.idade ||
      !this.novaConsulta.tutor ||
      !this.novaConsulta.tipoAtendimento ||
      !this.novaConsulta.data
    ) {
      alert('Preencha todos os campos antes de salvar a consulta.');
      return;
    }

    const consulta: ConsultaFuncionario = {
      hora: this.novaConsulta.hora,
      horario: this.novaConsulta.hora,
      periodo: this.novaConsulta.periodo,
      pet: this.novaConsulta.pet,
      idade: this.novaConsulta.idade,
      tutor: this.novaConsulta.tutor,
      motivo: this.novaConsulta.tipoAtendimento,
      status: 'AGENDADO',
      data: this.novaConsulta.data,
      imagem: '',
      tipo: 'gray'
    };

    this.consultasService.adicionarConsulta(consulta);
    this.consultas = this.consultasService.listarConsultas();
    this.fecharNovaConsulta();
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

    const status = this.normalizarStatus(this.consultaEditando.status);

    Object.assign(this.consultaSelecionada, {
      ...this.consultaEditando,
      status,
      tipo: this.definirTipoStatus(status)
    });

    this.consultasService.salvarAlteracoes();
    this.fecharEdicao();
  }

  alterarStatus(consulta: ConsultaFuncionario, status: string): void {
    if (!status) return;

    const statusNormalizado = this.normalizarStatus(status);

    this.consultasService.atualizarStatus(consulta, statusNormalizado);

    consulta.status = statusNormalizado;
    consulta.tipo = this.definirTipoStatus(statusNormalizado);
  }

  iniciarConsulta(consulta: ConsultaFuncionario): void {
    this.alterarStatus(consulta, 'EM ATENDIMENTO');
  }

  excluirConsulta(consulta: ConsultaFuncionario): void {
    const confirmar = confirm(`Deseja excluir a consulta de ${consulta.pet}?`);

    if (!confirmar) return;

    this.consultasService.removerConsulta(consulta);
    this.consultas = this.consultasService.listarConsultas();
    this.consultaSelecionada = null;

    if (this.paginaAtual > this.totalPaginas) {
      this.paginaAtual = this.totalPaginas;
    }
  }

  inicialPet(consulta: ConsultaFuncionario | null): string {
    if (!consulta || !consulta.pet) return 'P';
    return consulta.pet.charAt(0).toUpperCase();
  }

  statusClasse(status: string): string {
    return this.normalizarStatus(status)
      .toLowerCase()
      .replace(/\s+/g, '-');
  }

  private definirTipoStatus(status: string): string {
    const statusNormalizado = this.normalizarStatus(status);

    if (statusNormalizado === 'CONFIRMADO') return 'green';
    if (statusNormalizado === 'URGENTE' || statusNormalizado === 'CANCELADO') return 'red';
    if (statusNormalizado === 'EM ATENDIMENTO') return 'blue';

    return 'gray';
  }

  private normalizarStatus(status: string): string {
    return status
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase();
  }

  private pegarDataHoje(): string {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');

    return `${ano}-${mes}-${dia}`;
  }

  formatarData(data: string): string {
    if (!data) {
      return 'Data não informada';
    }

    const [ano, mes, dia] = data.split('-');

    if (!ano || !mes || !dia) {
      return data;
    }

    return `${dia}/${mes}/${ano}`;
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