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
  periodo: string;
  motivo: string;
  status: string;
  tipo: string;
  observacoes: string;
}

@Component({
  selector: 'app-home-funcionario',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './home-funcionario.component.html',
  styleUrl: './home-funcionario.component.css'
})
export class HomeFuncionarioComponent implements OnInit {

  filtroAberto = false;
  prontuarioAberto = false;
  dialogoAberto = false;

  dialogoTitulo = '';
  dialogoMensagem = '';

  filtroSelecionado = 'Todos';
  consultaSelecionada: ConsultaHome | null = null;

  dataAtual = '';
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
  }

  carregarDadosHome(): void {
    this.http.get<any>(`${environment.apiUrl}/funcionario`, { withCredentials: true }).subscribe({
      next: (res) => {
        if (res.funcionario) {
          const prefixo = res.funcionario.especialidade === 'veterinario' ? 'Dr(a).' : 'Prof.';
          this.saudacaoNome = `${prefixo} ${res.funcionario.nome}`;
          this.cargaDisponivel = res.funcionario.carga;
          this.especialidade = res.funcionario.especialidade === 'veterinario' ? 'Veterinário' : 'Tosador';
        }

        if (res.consultas) {
          this.consultas = res.consultas.map((c: any) => {
            const [hora] = c.hora_inicio.split(':').map(Number);
            const periodoCalculado = hora >= 12 ? 'PM' : 'AM';
            
            const statusBanco = c.status ? c.status.trim().toLowerCase() : '';
            let statusPill = 'AGENDADO';
            let corTag = 'gray';

            if (statusBanco === 'em_espera' || statusBanco === 'em espera') { 
              statusPill = 'EM ESPERA'; 
              corTag = 'gray'; 
            } else if (statusBanco === 'em_endamento' || statusBanco === 'em andamento') { 
              statusPill = 'EM ATENDIMENTO'; 
              corTag = 'blue'; 
            } else if (statusBanco === 'finalizado') { 
              statusPill = 'FINALIZADO'; 
              corTag = 'green'; 
            }

            return {
              id_consulta: c.id_consulta,
              id_pet: c.id_pet,
              pet: c.pet?.nome || 'Paciente',
              tutor: c.pet?.usuario ? `${c.pet.usuario.nome} ${c.pet.usuario.sobrenome || ''}`.trim() : 'Não informado',
              horario: c.hora_inicio,
              periodo: periodoCalculado,
              motivo: this.especialidade === 'Veterinário' ? 'Consulta Geral' : 'Estética / Banho',
              status: statusPill,
              tipo: corTag,
              observacoes: c.observacoes || 'Nenhuma observação registrada.'
            };
          });
        }
        this.consultaSelecionada = null;
      },
      error: (err) => console.error('Erro ao carregar dashboard:', err)
    });
  }

  baterPonto(): void {
    if (!confirm('Confirmar batida de ponto para restaurar sua carga horária?')) return;

    this.http.post<any>(`${environment.apiUrl}/funcionario/bater-ponto`, {}, { withCredentials: true }).subscribe({
      next: (res) => {
        this.abrirDialogo('Ponto Registrado', res.mensagem || 'Sua carga foi reestabelecida.');
        this.carregarDadosHome();
      },
      error: (err) => {
        console.error(err);
        this.abrirDialogo('Erro', 'Não foi possível registrar o ponto.');
      }
    });
  }

  get consultasHomePaginadas(): ConsultaHome[] {
    return this.consultasFiltradas.slice(0, 3);
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

    this.http.put(`${environment.apiUrl}/funcionario/consultas/atualizar/${this.consultaSelecionada.id_consulta}`, {}, { withCredentials: true }).subscribe({
      next: () => {
        this.prontuarioAberto = false;
        this.abrirDialogo('Atendimento Iniciado', `O prontuário de ${this.consultaSelecionada?.pet} está aberto.`);
        this.carregarDadosHome();
      },
      error: (err) => console.error('Erro ao iniciar atendimento:', err)
    });
  }

  abrirDialogo(titulo: string, mensagem: string): void {
    this.dialogoTitulo = titulo;
    this.dialogoMensagem = mensagem;
    this.dialogoAberto = true;
  }

  fecharDialogo(): void { this.dialogoAberto = false; }

  inicialPet(consulta: ConsultaHome | null): string {
    return consulta && consulta.pet ? consulta.pet.charAt(0).toUpperCase() : 'P';
  }
}