import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface ConsultaFuncionario {
  id: number;
  hora: string;
  hora_fim: string;
  pet: string;
  especie: string;
  idade: string;
  tutor: string;
  motivo: string;
  status: string;
  data: string;
  tipo: string;
  podeIniciar: boolean;
  podeFinalizar: boolean;
  expirado: boolean;
}

type Periodo = 'hoje' | 'proximas' | 'todas';

@Component({
  selector: 'app-consultas-funcionario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './consultas-funcionario.component.html',
  styleUrl: './consultas-funcionario.component.css'
})
export class ConsultasFuncionarioComponent implements OnInit {

  // Filtros aplicados na hora (sem botão "Aplicar")
  termoBusca = '';
  dataSelecionada = '';
  statusSelecionado = 'Todos';
  periodo: Periodo = 'todas';

  readonly filtrosStatus = [
    { valor: 'Todos', rotulo: 'Todos' },
    { valor: 'EM ESPERA', rotulo: 'Em espera' },
    { valor: 'EM ATENDIMENTO', rotulo: 'Em atendimento' },
    { valor: 'ATRASADO', rotulo: 'Atrasadas' },
    { valor: 'FINALIZADO', rotulo: 'Finalizadas' }
  ];

  paginaAtual = 1;
  itensPorPagina = 8;

  consultas: ConsultaFuncionario[] = [];
  consultaSelecionada: ConsultaFuncionario | null = null;

  carregando = true;
  salvando = false;
  modalDetalhesAberto = false;
  erroMensagem = '';

  private readonly hojeStr = this.formatarDataISO(new Date());

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.carregarConsultasDoBanco();
  }

  carregarConsultasDoBanco(): void {
    this.erroMensagem = '';
    this.carregando = true;
    this.http.get<any>(`${environment.apiUrl}/funcionario/consultas`, { withCredentials: true }).subscribe({
      next: (res) => {
        this.carregando = false;
        if (res && res.consultas) {
          this.consultas = res.consultas.map((c: any) => {
            const statusMapeado = this.normalizarStatus(c.status);
            const expirado = this.verificarSeExpirou(c.data_consulta, c.hora_fim);

            let statusFinal = statusMapeado;
            if (statusMapeado === 'EM ATENDIMENTO' && expirado) {
              statusFinal = 'ATRASADO';
            }

            return {
              id: c.id_consulta,
              hora: c.hora_inicio,
              hora_fim: c.hora_fim,
              pet: c.pet?.nome || 'Paciente',
              especie: c.pet?.especie || 'Pet',
              idade: c.pet?.idade ? `${c.pet.idade} ano(s)` : 'Não informada',
              tutor: c.pet?.usuario ? `${c.pet.usuario.nome} ${c.pet.usuario.sobrenome || ''}`.trim() : 'Não informado',
              motivo: 'Atendimento Clínico',
              status: statusFinal,
              data: c.data_consulta ? c.data_consulta.split('T')[0] : '',
              tipo: this.definirTipoStatus(statusMapeado),
              podeIniciar: this.verificarJanelaInicio(c.data_consulta, c.hora_inicio),
              podeFinalizar: this.verificarJanelaTempo(c.data_consulta, c.hora_fim),
              expirado
            } as ConsultaFuncionario;
          });

          // Mantém a ficha aberta atualizada depois de mudar o status
          if (this.consultaSelecionada) {
            this.consultaSelecionada = this.consultas.find(c => c.id === this.consultaSelecionada!.id) || null;
          }
        }
      },
      error: (err) => {
        this.carregando = false;
        console.error('Erro ao buscar consultas:', err);
        this.erroMensagem = 'Não foi possível carregar suas consultas.';
      }
    });
  }

  verificarSeExpirou(dataConsulta: string, horaFim: string): boolean {
    if (!dataConsulta || !horaFim) return false;
    const agora = new Date();
    const dataStr = dataConsulta.split('T')[0];
    const [h, m] = horaFim.split(':').map(Number);
    const dataFimReal = new Date(`${dataStr}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`);

    return agora > dataFimReal && agora.toDateString() === dataFimReal.toDateString();
  }

  verificarJanelaInicio(dataConsulta: string, horaInicio: string): boolean {
    if (!dataConsulta || !horaInicio) return false;
    const agora = new Date();
    const dataStr = dataConsulta.split('T')[0];
    const [h, m] = horaInicio.split(':').map(Number);
    const dataInicioReal = new Date(`${dataStr}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`);

    return agora >= dataInicioReal;
  }

  verificarJanelaTempo(dataConsulta: string, horaFim: string): boolean {
    if (!dataConsulta || !horaFim) return false;
    const agora = new Date();
    const dataStr = dataConsulta.split('T')[0];
    const [h, m] = horaFim.split(':').map(Number);
    const dataFimReal = new Date(`${dataStr}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`);
    const limiteFim = new Date(dataFimReal.getTime() + 10 * 60 * 1000);

    return agora >= dataFimReal && agora <= limiteFim;
  }

  // ---------- Filtros ----------

  private filtrarSemStatus(): ConsultaFuncionario[] {
    const termo = this.termoBusca.trim().toLowerCase();

    return this.consultas.filter(c => {
      const matchBusca = !termo || c.pet.toLowerCase().includes(termo) || c.tutor.toLowerCase().includes(termo);
      const matchData = !this.dataSelecionada || c.data === this.dataSelecionada;

      let matchPeriodo = true;
      if (this.periodo === 'hoje') matchPeriodo = c.data === this.hojeStr;
      if (this.periodo === 'proximas') matchPeriodo = c.data >= this.hojeStr && c.status !== 'FINALIZADO';

      return matchBusca && matchData && matchPeriodo;
    });
  }

  get consultasFiltradas(): ConsultaFuncionario[] {
    return this.filtrarSemStatus()
      .filter(c => this.statusSelecionado === 'Todos' || c.status === this.statusSelecionado)
      .sort((a, b) => (a.data + a.hora).localeCompare(b.data + b.hora));
  }

  contarStatus(status: string): number {
    const base = this.filtrarSemStatus();
    return status === 'Todos' ? base.length : base.filter(c => c.status === status).length;
  }

  get totalHoje(): number { return this.consultas.filter(c => c.data === this.hojeStr).length; }
  get totalEmEspera(): number { return this.consultas.filter(c => c.status === 'EM ESPERA').length; }
  get totalEmAtendimento(): number { return this.consultas.filter(c => c.status === 'EM ATENDIMENTO' || c.status === 'ATRASADO').length; }
  get totalFinalizadas(): number { return this.consultas.filter(c => c.status === 'FINALIZADO').length; }

  get temFiltroAtivo(): boolean {
    return !!this.termoBusca || !!this.dataSelecionada || this.statusSelecionado !== 'Todos' || this.periodo !== 'todas';
  }

  aplicarFiltros(): void { this.paginaAtual = 1; }

  definirStatus(status: string): void {
    this.statusSelecionado = status;
    this.aplicarFiltros();
  }

  definirPeriodo(periodo: Periodo): void {
    this.periodo = periodo;
    if (periodo !== 'todas') this.dataSelecionada = '';
    this.aplicarFiltros();
  }

  filtrarHoje(): void {
    this.statusSelecionado = 'Todos';
    this.definirPeriodo('hoje');
  }

  limparBusca(): void {
    this.termoBusca = '';
    this.aplicarFiltros();
  }

  limparFiltros(): void {
    this.termoBusca = '';
    this.dataSelecionada = '';
    this.statusSelecionado = 'Todos';
    this.periodo = 'todas';
    this.aplicarFiltros();
  }

  // ---------- Paginação ----------

  get totalPaginas(): number { return Math.max(Math.ceil(this.consultasFiltradas.length / this.itensPorPagina), 1); }
  get paginas(): number[] { return Array.from({ length: this.totalPaginas }, (_, i) => i + 1); }
  get consultasPaginadas(): ConsultaFuncionario[] {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    return this.consultasFiltradas.slice(inicio, inicio + this.itensPorPagina);
  }

  mudarPagina(p: number): void { this.paginaAtual = p; }

  // ---------- Ações ----------

  alterarStatus(consulta: ConsultaFuncionario, statusDestino: string): void {
    this.erroMensagem = '';
    let statusBanco = 'em_espera';
    if (statusDestino === 'EM ATENDIMENTO') statusBanco = 'em_andamento';
    if (statusDestino === 'FINALIZADO') statusBanco = 'finalizado';

    this.salvando = true;
    this.http.put(`${environment.apiUrl}/funcionario/consultas/atualizar/${consulta.id}`, { novoStatus: statusBanco }, { withCredentials: true })
      .subscribe({
        next: () => {
          this.salvando = false;
          this.carregarConsultasDoBanco();
        },
        error: (err) => {
          this.salvando = false;
          this.erroMensagem = err.error?.mensagem || 'Fora da janela de alteração permitida.';
          this.modalDetalhesAberto = false;
        }
      });
  }

  // ---------- Apresentação ----------

  inicialPet(consulta: ConsultaFuncionario): string { return consulta.pet ? consulta.pet.charAt(0).toUpperCase() : 'P'; }

  ehHoje(data: string): boolean { return data === this.hojeStr; }

  pillClasse(status: string): string {
    switch (status) {
      case 'FINALIZADO': return 'pill-ok';
      case 'ATRASADO': return 'pill-danger';
      case 'EM ATENDIMENTO': return 'pill-info';
      case 'EM ESPERA': return 'pill-warn';
      default: return 'pill-muted';
    }
  }

  statusRotulo(status: string): string {
    switch (status) {
      case 'EM ESPERA': return 'Em espera';
      case 'EM ATENDIMENTO': return 'Em atendimento';
      case 'ATRASADO': return 'Atrasada';
      case 'FINALIZADO': return 'Finalizada';
      default: return status.charAt(0) + status.slice(1).toLowerCase();
    }
  }

  private definirTipoStatus(status: string): string {
    if (status === 'FINALIZADO') return 'green';
    if (status === 'EM ATENDIMENTO') return 'blue';
    return 'gray';
  }

  public normalizarStatus(status: string): string {
    if (!status) return 'PENDENTE';
    const st = status.trim().toUpperCase();
    if (st === 'EM_ESPERA') return 'EM ESPERA';
    if (st === 'EM_ANDAMENTO' || st === 'EM_ENDAMENTO' || st === 'EM ANDAMENTO') return 'EM ATENDIMENTO';
    return st;
  }

  formatarData(data: string): string {
    if (!data) return '';
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  }

  private formatarDataISO(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  abrirDetalhes(consulta: ConsultaFuncionario): void { this.consultaSelecionada = consulta; this.modalDetalhesAberto = true; }
  fecharDetalhes(): void { this.modalDetalhesAberto = false; }
}