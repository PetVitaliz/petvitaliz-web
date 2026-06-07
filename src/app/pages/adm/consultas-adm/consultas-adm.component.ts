import { Component, DoCheck, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ConsultasService,
  ConsultaFuncionario
} from '../../../core/services/consultas.service';

interface ConsultaAdm extends ConsultaFuncionario {
  dataObj: Date;
  vet: string;
  procedimento: string;
}

@Component({
  selector: 'app-consultas-adm',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './consultas-adm.component.html',
  styleUrl: './consultas-adm.component.css'
})
export class ConsultasAdmComponent implements OnInit, DoCheck {

  termoBusca = '';
  statusSelecionado = 'Todos';
  vetSelecionado = 'Todos';
  periodoSelecionado = 'Todos';

  paginaAtual = 1;
  itensPorPagina = 5;

  menuAberto: number | null = null;

  hoje = new Date();
  diaSelecionado = this.hoje.getDate();
  mesAtual = this.hoje.getMonth();
  anoAtual = this.hoje.getFullYear();

  consultas: ConsultaAdm[] = [];

  private totalConsultasAnterior = 0;

  meses = [
    'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
    'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'
  ];

  constructor(private consultasService: ConsultasService) { }

  ngOnInit(): void {

    this.carregarConsultas();

  }

  ngDoCheck(): void {
    const totalAtual = this.consultasService.listarConsultas().length;

    if (totalAtual !== this.totalConsultasAnterior) {
      this.carregarConsultas();
    }
  }

  carregarConsultas(): void {
    const lista = this.consultasService.listarConsultas();

    this.totalConsultasAnterior = lista.length;

    this.consultas = lista.map((consulta: ConsultaFuncionario) => {
      const dataObj = this.criarDataObj(consulta.data);

      return {
        ...consulta,
        dataObj,
        vet: 'Dr. Rogério Souza',
        procedimento: consulta.motivo
      };
    });
  }

  get diasCalendario() {
    const primeiroDia = new Date(this.anoAtual, this.mesAtual, 1);
    const ultimoDia = new Date(this.anoAtual, this.mesAtual + 1, 0);

    const diasNoMes = ultimoDia.getDate();
    const diaSemanaInicio = primeiroDia.getDay();

    const dias: any[] = [];
    const ultimoDiaMesAnterior = new Date(this.anoAtual, this.mesAtual, 0).getDate();

    for (let i = diaSemanaInicio - 1; i >= 0; i--) {
      dias.push({
        numero: ultimoDiaMesAnterior - i,
        outroMes: true
      });
    }

    for (let dia = 1; dia <= diasNoMes; dia++) {
      dias.push({
        numero: dia,
        outroMes: false
      });
    }

    const restante = 42 - dias.length;

    for (let dia = 1; dia <= restante; dia++) {
      dias.push({
        numero: dia,
        outroMes: true
      });
    }

    return dias;
  }

  get consultasFiltradas(): ConsultaAdm[] {
    return this.consultas.filter((c: ConsultaAdm) => {
      const busca = this.termoBusca.toLowerCase();

      const passaBusca =
        c.pet.toLowerCase().includes(busca) ||
        c.tutor.toLowerCase().includes(busca) ||
        c.motivo.toLowerCase().includes(busca);

      const passaStatus =
        this.statusSelecionado === 'Todos' ||
        this.normalizarStatus(c.status) === this.normalizarStatus(this.statusSelecionado);

      const passaVet =
        this.vetSelecionado === 'Todos' ||
        c.vet === this.vetSelecionado;

      const passaPeriodo = this.filtrarPorPeriodo(c.dataObj);

      return passaBusca && passaStatus && passaVet && passaPeriodo;
    });
  }

  get consultasPaginadas(): ConsultaAdm[] {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    return this.consultasFiltradas.slice(inicio, inicio + this.itensPorPagina);
  }

  get totalPaginas(): number {
    return Math.max(Math.ceil(this.consultasFiltradas.length / this.itensPorPagina), 1);
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  get totalPendentes(): number {
    return this.consultas.filter((c: ConsultaAdm) => this.normalizarStatus(c.status) === 'Pendente').length;
  }

  get temUrgentes(): boolean {
    return this.consultas.some((c: ConsultaAdm) => c.tipo === 'red' || this.normalizarStatus(c.status) === 'Urgente');
  }

  get consultasHoje(): number {
    return this.consultas.filter((c: ConsultaAdm) => this.ehMesmaData(c.dataObj, this.hoje)).length;
  }

  aplicarFiltros(): void {
    this.paginaAtual = 1;
    this.menuAberto = null;
    this.carregarConsultas();
  }

  mudarPagina(p: number): void {
    if (p >= 1 && p <= this.totalPaginas) {
      this.paginaAtual = p;
      this.menuAberto = null;
    }
  }

  abrirMenu(i: number): void {
    this.menuAberto = this.menuAberto === i ? null : i;
  }

  confirmar(c: ConsultaAdm): void {
    this.consultasService.atualizarStatus(c, 'CONFIRMADO');
    c.status = 'CONFIRMADO';
    c.tipo = this.consultasService.definirTipo('CONFIRMADO');
    this.menuAberto = null;
    this.carregarConsultas();
  }

  cancelar(c: ConsultaAdm): void {
    this.consultasService.atualizarStatus(c, 'CANCELADO');
    c.status = 'CANCELADO';
    c.tipo = this.consultasService.definirTipo('CANCELADO');
    this.menuAberto = null;
    this.carregarConsultas();
  }

  finalizar(c: ConsultaAdm): void {
    this.consultasService.atualizarStatus(c, 'FINALIZADO');
    c.status = 'FINALIZADO';
    c.tipo = this.consultasService.definirTipo('FINALIZADO');
    this.menuAberto = null;
    this.carregarConsultas();
  }

  selecionarDia(dia: any): void {
    if (dia.outroMes) return;

    this.diaSelecionado = dia.numero;
    this.periodoSelecionado = 'Dia selecionado';
    this.paginaAtual = 1;
    this.carregarConsultas();
  }

  mesAnterior(): void {
    if (this.mesAtual === 0) {
      this.mesAtual = 11;
      this.anoAtual--;
    } else {
      this.mesAtual--;
    }

    this.diaSelecionado = 1;
  }

  proximoMes(): void {
    if (this.mesAtual === 11) {
      this.mesAtual = 0;
      this.anoAtual++;
    } else {
      this.mesAtual++;
    }

    this.diaSelecionado = 1;
  }

  filtrarPorPeriodo(data: Date): boolean {
    if (this.periodoSelecionado === 'Todos') {
      return true;
    }

    const hoje = this.inicioDoDia(new Date());
    const dataConsulta = this.inicioDoDia(data);

    if (this.periodoSelecionado === 'Hoje') {
      return this.ehMesmaData(dataConsulta, hoje);
    }

    if (this.periodoSelecionado === 'Dia selecionado') {
      const selecionada = new Date(
        this.anoAtual,
        this.mesAtual,
        this.diaSelecionado
      );

      return this.ehMesmaData(dataConsulta, selecionada);
    }

    if (this.periodoSelecionado === 'Semana') {
      const seteDias = this.adicionarDias(7);
      return dataConsulta >= hoje && dataConsulta <= seteDias;
    }

    if (this.periodoSelecionado === 'Mês') {
      return (
        dataConsulta.getMonth() === this.mesAtual &&
        dataConsulta.getFullYear() === this.anoAtual
      );
    }

    return true;
  }

  ehMesmaData(data1: Date, data2: Date): boolean {
    return (
      data1.getDate() === data2.getDate() &&
      data1.getMonth() === data2.getMonth() &&
      data1.getFullYear() === data2.getFullYear()
    );
  }

  adicionarDias(dias: number): Date {
    const data = new Date();
    data.setDate(data.getDate() + dias);
    return data;
  }

  inicioDoDia(data: Date): Date {
    return new Date(data.getFullYear(), data.getMonth(), data.getDate());
  }

  formatarData(data: Date): string {
    const dia = data.getDate().toString().padStart(2, '0');
    const mes = this.meses[data.getMonth()].substring(0, 3);
    const ano = data.getFullYear();

    return `${dia} ${mes} ${ano}`;
  }

  criarDataObj(data: string): Date {
    if (!data) {
      return new Date();
    }

    if (data.includes('/')) {
      const partes = data.split('/');

      const dia = Number(partes[0]);
      const mes = Number(partes[1]) - 1;
      const ano = Number(partes[2]);

      return new Date(ano, mes, dia);
    }

    if (data.includes('-')) {
      const partes = data.split('-');

      const ano = Number(partes[0]);
      const mes = Number(partes[1]) - 1;
      const dia = Number(partes[2]);

      return new Date(ano, mes, dia);
    }

    return new Date();
  }

  normalizarStatus(status: string): string {
    const texto = status
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase();

    if (texto === 'CONFIRMADO' || texto === 'CONFIRMADA') return 'Confirmada';
    if (texto === 'CANCELADO' || texto === 'CANCELADA') return 'Cancelada';
    if (texto === 'FINALIZADO' || texto === 'FINALIZADA') return 'Finalizada';
    if (texto === 'PENDENTE') return 'Pendente';
    if (texto === 'URGENTE') return 'Urgente';
    if (texto === 'AGENDADO' || texto === 'AGENDADA') return 'Agendado';
    if (texto === 'EM ANDAMENTO' || texto === 'EM ATENDIMENTO') return 'Em andamento';

    return status;
  }
}