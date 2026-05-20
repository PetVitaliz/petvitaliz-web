import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-consultas-adm',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './consultas-adm.component.html',
  styleUrl: './consultas-adm.component.css'
})
export class ConsultasAdmComponent {

  termoBusca = '';
  statusSelecionado = 'Todos';
  vetSelecionado = 'Todos';
  periodoSelecionado = 'Hoje';

  paginaAtual = 1;
  itensPorPagina = 5;

  menuAberto: number | null = null;

  hoje = new Date();
  diaSelecionado = this.hoje.getDate();
  mesAtual = this.hoje.getMonth();
  anoAtual = this.hoje.getFullYear();

  meses = [
    'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
    'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'
  ];

  consultas = [
    {
      hora: '09:30',
      data: this.formatarData(new Date()),
      dataObj: new Date(),
      pet: 'Max',
      tutor: 'Ana Paula',
      vet: 'Dr. Ricardo Silva',
      procedimento: 'Check-up Geral',
      status: 'Confirmada'
    },
    {
      hora: '10:45',
      data: this.formatarData(new Date()),
      dataObj: new Date(),
      pet: 'Luna',
      tutor: 'Marcos Mendes',
      vet: 'Dra. Marina Costa',
      procedimento: 'Vacinação',
      status: 'Em andamento'
    },
    {
      hora: '13:15',
      data: this.formatarData(new Date()),
      dataObj: new Date(),
      pet: 'Bolinha',
      tutor: 'Pedro Rocha',
      vet: 'Dr. Ricardo Silva',
      procedimento: 'Ortopedia',
      status: 'Pendente'
    },
    {
      hora: '14:00',
      data: this.formatarData(this.adicionarDias(1)),
      dataObj: this.adicionarDias(1),
      pet: 'Thor',
      tutor: 'Camila Souza',
      vet: 'Dra. Marina Costa',
      procedimento: 'Retorno',
      status: 'Confirmada'
    },
    {
      hora: '15:30',
      data: this.formatarData(this.adicionarDias(2)),
      dataObj: this.adicionarDias(2),
      pet: 'Mel',
      tutor: 'Fernanda Lima',
      vet: 'Dr. Ricardo Silva',
      procedimento: 'Exames',
      status: 'Pendente'
    }
  ];

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

  get consultasFiltradas() {
    return this.consultas.filter(c => {
      const busca = this.termoBusca.toLowerCase();

      const passaBusca =
        c.pet.toLowerCase().includes(busca) ||
        c.tutor.toLowerCase().includes(busca) ||
        c.procedimento.toLowerCase().includes(busca);

      const passaStatus =
        this.statusSelecionado === 'Todos' ||
        c.status === this.statusSelecionado;

      const passaVet =
        this.vetSelecionado === 'Todos' ||
        c.vet === this.vetSelecionado;

      const passaPeriodo = this.filtrarPorPeriodo(c.dataObj);

      return passaBusca && passaStatus && passaVet && passaPeriodo;
    });
  }

  get consultasPaginadas() {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    return this.consultasFiltradas.slice(inicio, inicio + this.itensPorPagina);
  }

  get totalPaginas() {
    return Math.ceil(this.consultasFiltradas.length / this.itensPorPagina);
  }

  get paginas() {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  get totalPendentes() {
    return this.consultas.filter(c => c.status === 'Pendente').length;
  }

  get temUrgentes() {
    return this.totalPendentes > 0;
  }

  get consultasHoje() {
    return this.consultas.filter(c => this.ehMesmaData(c.dataObj, this.hoje)).length;
  }

  aplicarFiltros() {
    this.paginaAtual = 1;
    this.menuAberto = null;
  }

  mudarPagina(p: number) {
    if (p >= 1 && p <= this.totalPaginas) {
      this.paginaAtual = p;
      this.menuAberto = null;
    }
  }

  abrirMenu(i: number) {
    this.menuAberto = this.menuAberto === i ? null : i;
  }

  confirmar(c: any) {
    c.status = 'Confirmada';
    this.menuAberto = null;
  }

  cancelar(c: any) {
    c.status = 'Cancelada';
    this.menuAberto = null;
  }

  finalizar(c: any) {
    c.status = 'Finalizada';
    this.menuAberto = null;
  }

  encaixarEmergencia() {
    const agora = new Date();

    this.consultas.unshift({
      hora: 'Agora',
      data: this.formatarData(agora),
      dataObj: agora,
      pet: 'Emergência',
      tutor: 'Aguardando confirmação',
      vet: 'Plantão',
      procedimento: 'Urgência',
      status: 'Pendente'
    });

    this.periodoSelecionado = 'Hoje';
    this.paginaAtual = 1;
  }

  selecionarDia(dia: any) {
    if (dia.outroMes) return;

    this.diaSelecionado = dia.numero;

    const dataSelecionada = new Date(this.anoAtual, this.mesAtual, dia.numero);
    this.periodoSelecionado = 'Dia selecionado';

    this.consultas = this.consultas.map(c => c);
    this.paginaAtual = 1;
  }

  mesAnterior() {
    if (this.mesAtual === 0) {
      this.mesAtual = 11;
      this.anoAtual--;
    } else {
      this.mesAtual--;
    }

    this.diaSelecionado = 1;
  }

  proximoMes() {
    if (this.mesAtual === 11) {
      this.mesAtual = 0;
      this.anoAtual++;
    } else {
      this.mesAtual++;
    }

    this.diaSelecionado = 1;
  }

  filtrarPorPeriodo(data: Date) {
    const hoje = new Date();

    if (this.periodoSelecionado === 'Hoje') {
      return this.ehMesmaData(data, hoje);
    }

    if (this.periodoSelecionado === 'Dia selecionado') {
      const selecionada = new Date(this.anoAtual, this.mesAtual, this.diaSelecionado);
      return this.ehMesmaData(data, selecionada);
    }

    if (this.periodoSelecionado === 'Semana') {
      const seteDias = this.adicionarDias(7);
      return data >= this.inicioDoDia(hoje) && data <= seteDias;
    }

    if (this.periodoSelecionado === 'Mês') {
      return data.getMonth() === hoje.getMonth() && data.getFullYear() === hoje.getFullYear();
    }

    return true;
  }

  ehMesmaData(data1: Date, data2: Date) {
    return (
      data1.getDate() === data2.getDate() &&
      data1.getMonth() === data2.getMonth() &&
      data1.getFullYear() === data2.getFullYear()
    );
  }

  adicionarDias(dias: number) {
    const data = new Date();
    data.setDate(data.getDate() + dias);
    return data;
  }

  inicioDoDia(data: Date) {
    return new Date(data.getFullYear(), data.getMonth(), data.getDate());
  }

  formatarData(data: Date) {
    const dia = data.getDate().toString().padStart(2, '0');
    const mes = this.meses[data.getMonth()].substring(0, 3);
    const ano = data.getFullYear();

    return `${dia} ${mes} ${ano}`;
  }
}