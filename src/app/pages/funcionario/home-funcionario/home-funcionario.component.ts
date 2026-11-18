import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface ConsultaHome {
  id_consulta: number;
  id_pet: number;
  pet: string;
  tutor: string;
  horario: string;
  motivo: string;
  status: string;
  tipo: string;
  observacoes: string;
  expirado: boolean
}

@Component({
  selector: 'app-home-funcionario',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './home-funcionario.component.html',
  styleUrl: './home-funcionario.component.css'
})
export class HomeFuncionarioComponent implements OnInit {
  
  dialogoTipo: 'sucesso' | 'atencao' | 'erro' = 'sucesso';
  filtroAberto = false;
  prontuarioAberto = false;
  dialogoAberto = false;

  dialogoTitulo = '';
  dialogoMensagem = '';

  filtroSelecionado = 'Todos';
  consultaSelecionada: ConsultaHome | null = null;

  dataAtual = '';
  dataFormatada = '';
  carregando = true;
  pontoConfirmAberto = false;
  registrandoPonto = false;
  saudacaoNome = 'Funcionário';
  cargaDisponivel = 0;
  especialidade = '';

  consultas: ConsultaHome[] = [];

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.definirDataAtual();
    this.carregarDadosHome();
  }

  definirDataAtual(): void {
    const hoje = new Date();
    this.dataAtual = hoje.toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long'
    });
    this.dataFormatada = hoje.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  carregarDadosHome(): void {
    this.carregando = true;
    this.http.get<any>(`${environment.apiUrl}/funcionario`, { withCredentials: true }).subscribe({
      next: (res) => {
        this.carregando = false;
        if (res.funcionario) {
          const prefixo = res.funcionario.especialidade === 'veterinario' ? 'Dr(a).' : 'Prof.';
          this.saudacaoNome = `${prefixo} ${res.funcionario.nome}`;
          this.cargaDisponivel = res.funcionario.carga;
          this.especialidade = res.funcionario.especialidade === 'veterinario' ? 'Veterinário' : 'Tosador';
        }

        if (res.consultas) {
          this.consultas = res.consultas.map((c: any) => {
            const [hora] = c.hora_inicio.split(':').map(Number);
            const expirado = this.verificarSeExpirou(c.data_consulta, c.hora_fim);
            
            const statusBanco = c.status ? c.status.trim().toLowerCase() : '';
            let statusPill = 'AGENDADO';
            let corTag = 'gray';

            if (statusBanco === 'em_espera' || statusBanco === 'em espera') { 
              statusPill = 'EM ESPERA'; corTag = 'gray'; 
            } else if (statusBanco === 'em_endamento' || statusBanco === 'em andamento') { 
              statusPill = expirado ? 'ATRASADO' : 'EM ATENDIMENTO';
              corTag = expirado ? 'red' : 'blue'; 
            } else if (statusBanco === 'finalizado') { 
              statusPill = 'FINALIZADO'; corTag = 'green'; 
            }

            return {
              id_consulta: c.id_consulta,
              id_pet: c.id_pet,
              pet: c.pet?.nome || 'Paciente',
              tutor: c.pet?.usuario ? `${c.pet.usuario.nome} ${c.pet.usuario.sobrenome || ''}`.trim() : 'Não informado',
              horario: c.hora_inicio,
              motivo: this.especialidade === 'Veterinário' ? 'Consulta Geral' : 'Estética / Banho',
              status: statusPill,
              tipo: corTag,
              observacoes: c.observacoes || 'Nenhuma observação registrada.'
            };
          });
        }
        this.consultaSelecionada = null;
      },
      error: (err) => {
        this.carregando = false;
        console.error('Erro ao carregar dashboard:', err);
      }
    });
  }

  abrirConfirmacaoPonto(): void { this.pontoConfirmAberto = true; }
  fecharConfirmacaoPonto(): void { this.pontoConfirmAberto = false; }

  baterPonto(): void {
    this.registrandoPonto = true;
    this.http.post<any>(`${environment.apiUrl}/funcionario/bater-ponto`, {}, { withCredentials: true }).subscribe({
      next: (res) => {
        this.registrandoPonto = false;
        this.pontoConfirmAberto = false;
        this.abrirDialogo('Ponto Registrado', res.mensagem || 'Sua carga foi reestabelecida.');
        this.carregarDadosHome();
      },
      error: (err) => {
        console.error(err);
        this.registrandoPonto = false;
        this.pontoConfirmAberto = false;
        this.abrirDialogo('Erro', 'Não foi possível registrar o ponto.', 'erro');
      }
    });
  }

  get consultasHomePaginadas(): ConsultaHome[] {
    return this.consultasFiltradas.slice(0, 6);
  }

  get consultasFiltradas(): ConsultaHome[] {
    if (this.filtroSelecionado === 'Todos') {
      return this.consultas;
    }
    return this.consultas.filter(c => c.status === this.filtroSelecionado);
  }

  get totalHoje(): number {
    return this.consultas.length;
  }

  get laudosPendentes(): number {
    return this.consultas.filter(c => c.status === 'EM ESPERA').length;
  }

  get emAtendimento(): number {
    return this.consultas.filter(c => c.status === 'EM ATENDIMENTO' || c.status === 'ATRASADO').length;
  }

  get finalizadas(): number {
    return this.consultas.filter(c => c.status === 'FINALIZADO').length;
  }

  get proximaConsulta(): ConsultaHome | null {
    return this.consultas.find(c => c.status === 'EM ESPERA' || c.status === 'AGENDADO') || null;
  }

  contarStatus(status: string): number {
    return status === 'Todos' ? this.consultas.length : this.consultas.filter(c => c.status === status).length;
  }

  pillClasse(status: string): string {
    switch (status) {
      case 'FINALIZADO': return 'pill-ok';
      case 'ATRASADO': return 'pill-danger';
      case 'EM ATENDIMENTO': return 'pill-info';
      case 'EM ESPERA': return 'pill-warn';
      default: return 'pill-muted';
    }
  }

  selecionarConsulta(consulta: ConsultaHome): void {
    this.consultaSelecionada = consulta;
  }

  abrirFiltros(): void { this.filtroAberto = true; }
  fecharFiltros(): void { this.filtroAberto = false; }

  aplicarFiltro(filtro: string): void {
    this.filtroSelecionado = filtro;
    this.consultaSelecionada = null;
    this.filtroAberto = false;
  }

  abrirProntuario(): void {
    if (!this.consultaSelecionada) {
      this.abrirDialogo('Atenção', 'Selecione uma consulta para visualizar o prontuário.');
      return;
    }
    this.prontuarioAberto = true;
  }

  fecharProntuario(): void { this.prontuarioAberto = false; }

  iniciarConsulta(): void {
    if (!this.consultaSelecionada) return;

    const payload = { novoStatus: 'em_endamento' };

    this.http.put(`${environment.apiUrl}/funcionario/consultas/atualizar/${this.consultaSelecionada.id_consulta}`, payload, { withCredentials: true }).subscribe({
      next: (res: any) => {
        this.prontuarioAberto = false;
        this.abrirDialogo('Atendimento Iniciado', `O atendimento de ${this.consultaSelecionada?.pet} foi iniciado com sucesso!`, 'sucesso');
        this.carregarDadosHome();
      },
      error: (err) => {
        console.error('Erro ao iniciar atendimento:', err);
        this.prontuarioAberto = false;
        
        const mensagemErro = err.error?.mensagem || 'Não foi possível iniciar o atendimento fora do horário agendado.';
        this.abrirDialogo('Atenção', mensagemErro, 'atencao');
      }
    });
  }

  abrirDialogo(titulo: string, mensagem: string, tipo: 'sucesso' | 'atencao' | 'erro' = 'sucesso'): void {
    this.dialogoTitulo = titulo;
    this.dialogoMensagem = mensagem;
    this.dialogoTipo = tipo;
    this.dialogoAberto = true;
  }

  fecharDialogo(): void { this.dialogoAberto = false; }

  inicialPet(consulta: ConsultaHome | null): string {
    return consulta && consulta.pet ? consulta.pet.charAt(0).toUpperCase() : 'P';
  }

  verificarSeExpirou(data: string, horaFim: string): boolean {
    if (!data || !horaFim) return false;
    const agora = new Date();
    const dataStr = data.split('T')[0];
    const [h, m] = horaFim.split(':').map(Number);
    const dataFimReal = new Date(`${dataStr}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`);

    return agora > dataFimReal && agora.toDateString() === dataFimReal.toDateString();
  }
  
}