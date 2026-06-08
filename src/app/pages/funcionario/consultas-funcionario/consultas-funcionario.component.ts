import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface ConsultaFuncionario {
  id: number;
  hora: string;
  horario: string;
  periodo: string;
  pet: string;
  idade: string;
  tutor: string;
  motivo: string;
  status: string;
  data: string;
  imagem: string;
  tipo: string;
}

@Component({
  selector: 'app-consultas-funcionario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './consultas-funcionario.component.html',
  styleUrl: './consultas-funcionario.component.css'
})
export class ConsultasFuncionarioComponent implements OnInit {

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
  dataMinima = this.pegarDataHoje();

  horariosDisponiveis = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

  novaConsulta = {
    hora: '',
    periodo: 'AM',
    pet: '',
    idade: '',
    tutor: '',
    tipoAtendimento: 'Consulta de rotina',
    data: ''
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.carregarConsultasDoBanco();
  }

  carregarConsultasDoBanco(): void {
    this.http.get<any>(`${environment.apiUrl}/funcionario/consultas`, { withCredentials: true }).subscribe({
      next: (res) => {
        if (res && res.consultas) {
          this.consultas = res.consultas.map((c: any) => {
            const [horaNum] = c.hora_inicio.split(':').map(Number);
            const statusMapeado = this.normalizarStatus(c.status);

            return {
              id: c.id_consulta,
              hora: c.hora_inicio,
              horario: c.hora_inicio,
              periodo: horaNum >= 12 ? 'PM' : 'AM',
              pet: c.pet?.nome || 'Paciente',
              idade: c.pet?.idade ? `${c.pet.idade} ano(s)` : 'Não informada',
              tutor: c.pet?.usuario ? `${c.pet.usuario.nome} ${c.pet.usuario.sobrenome || ''}`.trim() : 'Não informado',
              motivo: 'Atendimento Clínico',
              status: statusMapeado,
              data: c.data_consulta ? c.data_consulta.split('T')[0] : '',
              imagem: '',
              tipo: this.definirTipoStatus(statusMapeado)
            };
          });
        }
      },
      error: (err) => {
        console.error('Erro ao buscar consultas do funcionário:', err);
        this.consultas = [];
      }
    });
  }

  get consultasFiltradas(): ConsultaFuncionario[] {
    return this.consultas.filter(consulta => {
      const pet = this.filtrosAplicados.pet.trim().toLowerCase();

      const matchPet = !pet || consulta.pet.toLowerCase().includes(pet);
      const matchData = !this.filtrosAplicados.data || consulta.data === this.filtrosAplicados.data;

      const statusFiltro = this.normalizarStatus(this.filtrosAplicados.status);
      const matchStatus = this.filtrosAplicados.status === 'Todos os Status' || 
                          this.normalizarStatus(consulta.status) === statusFiltro;

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

  get horariosLivres(): string[] {
    return this.horariosDisponiveis.filter(horario => {
      return !this.consultas.some(consulta =>
        consulta.data === this.novaConsulta.data &&
        consulta.hora === horario &&
        this.normalizarStatus(consulta.status) !== 'CANCELADO'
      );
    });
  }

  aplicarFiltros(): void {
    this.filtrosAplicados = { ...this.filtros };
    this.paginaAtual = 1;
  }

  limparFiltros(): void {
    this.filtros = { pet: '', data: '', status: 'Todos os Status' };
    this.filtrosAplicados = { ...this.filtros };
    this.paginaAtual = 1;
  }

  mudarPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.paginaAtual = pagina;
  }

  abrirNovaConsulta(): void {
    this.dataMinima = this.pegarDataHoje();
    this.novaConsulta = {
      hora: '', periodo: 'AM', pet: '', idade: '', tutor: '',
      tipoAtendimento: 'Consulta de rotina', data: this.pegarDataHoje()
    };
    this.modalNovaConsultaAberto = true;
  }

  fecharNovaConsulta(): void { this.modalNovaConsultaAberto = false; }
  validarIdade(): void { this.novaConsulta.idade = this.novaConsulta.idade.replace(/\D/g, '').slice(0, 2); }

  salvarNovaConsulta(): void {
    alert('Para agendar novas consultas de tutores, utilize o fluxo de agendamento principal do cliente.');
    this.fecharNovaConsulta();
  }

  abrirDetalhes(consulta: ConsultaFuncionario): void {
    this.consultaSelecionada = consulta;
    this.modalDetalhesAberto = true;
  }

  fecharDetalhes(): void { this.modalDetalhesAberto = false; }

  abrirEdicao(consulta: ConsultaFuncionario): void {
    this.consultaSelecionada = consulta;
    this.consultaEditando = { ...consulta };
    this.modalEdicaoAberto = true;
  }

  fecharEdicao(): void { this.modalEdicaoAberto = false; }

  salvarEdicao(): void {
    if (!this.consultaSelecionada) return;
    this.alterarStatus(this.consultaSelecionada, this.consultaEditando.status);
    this.fecharEdicao();
  }

  alterarStatus(consulta: ConsultaFuncionario, status: string): void {
    if (!status) return;
    const statusNormalizado = this.normalizarStatus(status);

    let statusBanco = 'em_espera';
    if (statusNormalizado === 'EM ATENDIMENTO') statusBanco = 'em_endamento';
    else if (statusNormalizado === 'FINALIZADO') statusBanco = 'finalizado';

    this.http.put(`${environment.apiUrl}/funcionario/consultas/atualizar/${consulta.id}`, {}, { withCredentials: true })
      .subscribe({
        next: () => {
          this.carregarConsultasDoBanco();
        },
        error: (err) => console.error('Erro ao atualizar status da consulta:', err)
      });
  }

  iniciarConsulta(consulta: ConsultaFuncionario): void {
    this.alterarStatus(consulta, 'EM ATENDIMENTO');
  }

  excluirConsulta(consulta: ConsultaFuncionario): void {
    alert('A exclusão de registros históricos deve ser realizada através do painel de administração.');
  }

  inicialPet(consulta: ConsultaFuncionario | null): string {
    if (!consulta || !consulta.pet) return 'P';
    return consulta.pet.charAt(0).toUpperCase();
  }

  statusClasse(status: string): string {
    return this.normalizarStatus(status).toLowerCase().replace(/\s+/g, '-');
  }

  private definirTipoStatus(status: string): string {
    const st = this.normalizarStatus(status);
    if (st === 'CONFIRMADO' || st === 'CONFIRMADA') return 'green';
    if (st === 'URGENTE' || st === 'CANCELADO' || st === 'CANCELADA') return 'red';
    if (st === 'EM ATENDIMENTO' || st === 'EM_ENDAMENTO') return 'blue';
    if (st === 'FINALIZADO' || st === 'FINALIZADA') return 'green';
    return 'gray';
  }

  public normalizarStatus(status: string): string {
    if (!status) return 'PENDENTE';
    const st = status.trim().toUpperCase();
    if (st === 'EM_ESPERA') return 'EM ESPERA';
    if (st === 'EM_ENDAMENTO') return 'EM ATENDIMENTO';
    return st;
  }

  private pegarDataHoje(): string {
    const hoje = new Date();
    return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;
  }

  formatarData(data: string): string {
    if (!data) return 'Data não informada';
    const partes = data.split('-');
    return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : data;
  }

  private criarConsultaVazia(): ConsultaFuncionario {
    return { id: 0, hora: '', horario: '', periodo: '', pet: '', idade: '', tutor: '', motivo: '', status: '', data: '', imagem: '', tipo: '' };
  }
}