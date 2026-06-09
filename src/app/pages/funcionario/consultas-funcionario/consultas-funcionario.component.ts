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
  expirado: boolean
}

@Component({
  selector: 'app-consultas-funcionario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './consultas-funcionario.component.html',
  styleUrl: './consultas-funcionario.component.css'
})
export class ConsultasFuncionarioComponent implements OnInit {

  filtros = { pet: '', data: '', status: 'Todos os Status' };
  filtrosAplicados = { pet: '', data: '', status: 'Todos os Status' };

  paginaAtual = 1;
  itensPorPagina = 5;

  consultas: ConsultaFuncionario[] = [];
  consultaSelecionada: ConsultaFuncionario | null = null;
  
  modalDetalhesAberto = false;
  erroMensagem = '';


  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.carregarConsultasDoBanco();
  }

  carregarConsultasDoBanco(): void {
    this.erroMensagem = '';
    this.http.get<any>(`${environment.apiUrl}/funcionario/consultas`, { withCredentials: true }).subscribe({
      next: (res) => {
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
              expirado: this.verificarSeExpirou(c.data_consulta, c.hora_fim)
            };
          });
        }
      },
      error: (err) => console.error('Erro ao buscar consultas:', err)
    });
  }

  verificarSeExpirou(dataConsulta: string, horaFim: string): boolean {
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

  get consultasFiltradas(): ConsultaFuncionario[] {
    return this.consultas.filter(consulta => {
      const pet = this.filtrosAplicados.pet.trim().toLowerCase();
      const matchPet = !pet || consulta.pet.toLowerCase().includes(pet);
      const matchData = !this.filtrosAplicados.data || consulta.data === this.filtrosAplicados.data;
      const matchStatus = this.filtrosAplicados.status === 'Todos os Status' || consulta.status === this.filtrosAplicados.status;
      return matchPet && matchData && matchStatus;
    });
  }

  get totalPaginas(): number { return Math.max(Math.ceil(this.consultasFiltradas.length / this.itensPorPagina), 1); }
  get paginas(): number[] { return Array.from({ length: this.totalPaginas }, (_, i) => i + 1); }
  get consultasPaginadas(): ConsultaFuncionario[] {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    return this.consultasFiltradas.slice(inicio, inicio + this.itensPorPagina);
  }

  aplicarFiltros(): void { this.filtrosAplicados = { ...this.filtros }; this.paginaAtual = 1; }
  limparFiltros(): void { this.filtros = { pet: '', data: '', status: 'Todos os Status' }; this.aplicarFiltros(); }
  mudarPagina(p: number): void { this.paginaAtual = p; }

  alterarStatus(consulta: ConsultaFuncionario, statusDestino: string): void {
    this.erroMensagem = '';
    let statusBanco = 'em_espera';
    if (statusDestino === 'EM ATENDIMENTO') statusBanco = 'em_endamento';
    if (statusDestino === 'FINALIZADO') statusBanco = 'finalizado';

    this.http.put(`${environment.apiUrl}/funcionario/consultas/atualizar/${consulta.id}`, { novoStatus: statusBanco }, { withCredentials: true })
      .subscribe({
        next: () => this.carregarConsultasDoBanco(),
        error: (err) => {
          this.erroMensagem = err.error?.mensagem || 'Fora da janela de alteração permitida.';
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
  }

  inicialPet(consulta: ConsultaFuncionario): string { return consulta.pet ? consulta.pet.charAt(0).toUpperCase() : 'P'; }
  statusClasse(status: string): string { return status.toLowerCase().replace(/\s+/g, '-'); }

  private definirTipoStatus(status: string): string {
    if (status === 'FINALIZADO') return 'green';
    if (status === 'EM ATENDIMENTO') return 'blue';
    return 'gray';
  }

  public normalizarStatus(status: string): string {
    if (!status) return 'PENDENTE';
    const st = status.trim().toUpperCase();
    if (st === 'EM_ESPERA') return 'EM ESPERA';
    if (st === 'EM_ENDAMENTO') return 'EM ATENDIMENTO';
    return st;
  }

  formatarData(data: string): string {
    if (!data) return '';
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  }

  abrirDetalhes(consulta: ConsultaFuncionario): void { this.consultaSelecionada = consulta; this.modalDetalhesAberto = true; }
  fecharDetalhes(): void { this.modalDetalhesAberto = false; }
}