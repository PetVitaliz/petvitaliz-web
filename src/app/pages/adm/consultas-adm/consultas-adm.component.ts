import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface ConsultaAdm {
  id_consulta: number;
  hora: string;
  hora_fim: string;
  pet: string;
  tutor: string;
  vet: string;
  motivo: string;
  status: string;
  tipo: string;
  dataObj: Date;
  passouDoTempo: boolean; 
}

@Component({
  selector: 'app-consultas-adm',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './consultas-adm.component.html',
  styleUrl: './consultas-adm.component.css'
})
export class ConsultasAdmComponent implements OnInit {

  termoBusca = '';
  statusSelecionado = 'Todos';
  vetSelecionado = 'Todos';
  periodoSelecionado = 'Todos';

  paginaAtual = 1;
  itensPorPagina = 5;

  menuAberto: number | null = null;
  erroMensagem = '';

  hoje = new Date();
  diaSelecionado = this.hoje.getDate();
  mesAtual = this.hoje.getMonth();
  anoAtual = this.hoje.getFullYear();

  consultas: ConsultaAdm[] = [];
  listaVeterinarios: string[] = [];

  meses = [
    'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
    'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'
  ];

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.carregarConsultasDoBanco();
  }

  carregarConsultasDoBanco(): void {
    this.erroMensagem = '';
    this.http.get<any>(`${environment.apiUrl}/adm/consultas`, { withCredentials: true }).subscribe({
      next: (res) => {
        if (res && res.consultas) {
          const vetenariosSet = new Set<string>();
          const agora = new Date();

          this.consultas = res.consultas.map((c: any) => {
            const nomeVet = c.funcionario ? `Dr(a). ${c.funcionario.nome} ${c.funcionario.sobrenome || ''}`.trim() : 'Não atribuído';
            vetenariosSet.add(nomeVet);

            const statusMapeado = this.normalizarStatus(c.status);

            let dataCorrigida = new Date();
            if (c.data_consulta) {
              const apenasData = c.data_consulta.split('T')[0];
              const [ano, mes, dia] = apenasData.split('-').map(Number);
              dataCorrigida = new Date(ano, mes - 1, dia);
            }

            let esqueceuDeFinalizar = false;
            if (statusMapeado === 'Em andamento' && c.hora_fim) {
              const [h, m] = c.hora_fim.split(':').map(Number);
              const dataFimReal = new Date(dataCorrigida.getFullYear(), dataCorrigida.getMonth(), dataCorrigida.getDate(), h, m, 0);
              
              const limiteFim = new Date(dataFimReal.getTime() + 10 * 60 * 1000);
              
              if (agora > limiteFim) {
                esqueceuDeFinalizar = true;
              }
            }

            return {
              id_consulta: c.id_consulta,
              hora: c.hora_inicio,
              hora_fim: c.hora_fim,
              pet: c.pet?.nome || 'Paciente',
              tutor: c.pet?.usuario ? `${c.pet.usuario.nome} ${c.pet.usuario.sobrenome || ''}`.trim() : 'Não informado',
              vet: nomeVet,
              motivo: c.observacoes || 'Consulta Clínica',
              status: statusMapeado,
              tipo: esqueceuDeFinalizar ? 'red' : this.definirTipoClasse(statusMapeado),
              dataObj: dataCorrigida,
              passouDoTempo: esqueceuDeFinalizar
            };
          });

          this.listaVeterinarios = Array.from(vetenariosSet);
        }
      },
      error: (err) => {
        console.error('Erro ao carregar consultas no ADM:', err);
        this.erroMensagem = 'Não foi possível carregar os agendamentos.';
      }
    });
  }

  alterarStatusBanco(consulta: ConsultaAdm, statusDestino: string): void {
    let statusBanco = 'em_espera';
    if (statusDestino === 'Em andamento') statusBanco = 'em_endamento';
    if (statusDestino === 'Finalizada') statusBanco = 'finalizado';

    this.http.put(`${environment.apiUrl}/funcionario/consultas/atualizar/${consulta.id_consulta}`, { novoStatus: statusBanco }, { withCredentials: true })
      .subscribe({
        next: () => {
          this.menuAberto = null;
          this.carregarConsultasDoBanco();
        },
        error: (err) => {
          alert(err.error?.mensagem || 'Erro ao atualizar status pelo administrador.');
          this.menuAberto = null;
        }
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
      dias.push({ numero: ultimoDiaMesAnterior - i, outroMes: true });
    }
    for (let dia = 1; dia <= diasNoMes; dia++) {
      dias.push({ numero: dia, outroMes: false });
    }
    const restante = 42 - dias.length;
    for (let dia = 1; dia <= restante; dia++) {
      dias.push({ numero: dia, outroMes: true });
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
        c.status === this.statusSelecionado;

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
    return this.consultas.filter((c: ConsultaAdm) => c.status === 'Pendente').length;
  }

  get temUrgentes(): boolean {
    return this.consultas.some((c: ConsultaAdm) => c.status === 'Urgente');
  }

  get consultasHoje(): number {
    return this.consultas.filter((c: ConsultaAdm) => this.ehMesmaData(c.dataObj, this.hoje)).length;
  }

  aplicarFiltros(): void {
    this.paginaAtual = 1;
    this.menuAberto = null;
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

  confirmar(c: ConsultaAdm): void { this.alterarStatusBanco(c, 'Confirmada'); }
  finalizar(c: ConsultaAdm): void { this.alterarStatusBanco(c, 'Finalizada'); }
  cancelar(c: ConsultaAdm): void { this.alterarStatusBanco(c, 'Cancelada'); }

  selecionarDia(dia: any): void {
    if (dia.outroMes) return;
    this.diaSelecionado = dia.numero;
    this.periodoSelecionado = 'Dia selecionado';
    this.paginaAtual = 1;
  }

  mesAnterior(): void {
    if (this.mesAtual === 0) { this.mesAtual = 11; this.anoAtual--; } 
    else { this.mesAtual--; }
    this.diaSelecionado = 1;
  }

  proximoMes(): void {
    if (this.mesAtual === 11) { this.mesAtual = 0; this.anoAtual++; } 
    else { this.mesAtual++; }
    this.diaSelecionado = 1;
  }

  filtrarPorPeriodo(data: Date): boolean {
    if (this.periodoSelecionado === 'Todos') return true;
    const hojeZero = this.inicioDoDia(new Date());
    const dataConsulta = this.inicioDoDia(data);

    if (this.periodoSelecionado === 'Hoje') return this.ehMesmaData(dataConsulta, hojeZero);
    if (this.periodoSelecionado === 'Dia selecionado') {
      const selecionada = new Date(this.anoAtual, this.mesAtual, this.diaSelecionado);
      return this.ehMesmaData(dataConsulta, selecionada);
    }
    if (this.periodoSelecionado === 'Semana') {
      const seteDias = this.adicionarDias(7);
      return dataConsulta >= hojeZero && dataConsulta <= seteDias;
    }
    if (this.periodoSelecionado === 'Mês') {
      return dataConsulta.getMonth() === this.mesAtual && dataConsulta.getFullYear() === this.anoAtual;
    }
    return true;
  }

  ehMesmaData(data1: Date, data2: Date): boolean {
    return data1.getDate() === data2.getDate() && data1.getMonth() === data2.getMonth() && data1.getFullYear() === data2.getFullYear();
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

  private definirTipoClasse(status: string): string {
    if (status === 'Finalizada') return 'green';
    if (status === 'Em andamento') return 'blue';
    return 'gray';
  }

  public normalizarStatus(status: string): string {
    if (!status) return 'Pendente';
    const st = status.trim().toUpperCase();
    if (st === 'EM_ESPERA' || st === 'EM ESPERA') return 'Pendente';
    if (st === 'EM_ENDAMENTO' || st === 'EM ANDAMENTO') return 'Em andamento';
    if (st === 'FINALIZADO' || st === 'FINALIZADA') return 'Finalizada';
    return status;
  }
}