import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

type StatusAgendamento = 'em espera' | 'em andamento' | 'finalizado' | 'Cancelado';

interface Pet {
  id_pet: number;
  nome: string;
  especie: string;
  foto_url: string | null;
  idade: number;
}

interface Agendamento {
  id_consulta: number;
  nome_pet: string;
  servico: string;
  data_consulta: string;
  hora_inicio: string;
  status: StatusAgendamento;
  nome_funcionario?: string;
  observacoes?: string;
}

@Component({
  selector: 'app-agendamento',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agendamento.component.html',
  styleUrl: './agendamento.component.css'
})
export class AgendamentoComponent implements OnInit {
  etapaAtual = 1;
  pets: Pet[] = [];
  agendamentos: Agendamento[] = [];

  servicosCard = [
    { label: 'Consulta Geral (Veterinário)', valor: 'veterinario' },
    { label: 'Banho e Tosa (Tosador)', valor: 'tosador' }
  ];

  horarios: string[] = [];

  petSelecionadoId: number | null = null;
  petSelecionadoNome = '';
  servicoSelecionadoValor = '';
  dataSelecionada = '';
  horarioSelecionado = '';
  observacoes = '';

  mensagemErro = '';
  mensagemSucesso = '';
  carregando = false;

  constructor(private http: HttpClient, private router: Router) {
    this.gerarGradeHorarios();
  }

  ngOnInit(): void {
    this.buscarPetsDoUsuario();
    this.buscarAgendamentosDoUsuario();
  }

  private gerarGradeHorarios(): void {
    const lista = [];
    let atual = 8 * 60;
    const fim = 18 * 60;
    while (atual <= fim) {
      const h = Math.floor(atual / 60);
      const m = atual % 60;
      lista.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
      atual += 30;
    }
    this.horarios = lista;
  }

  buscarPetsDoUsuario(): void {
    this.http.get<any>(`${environment.apiUrl}/user/listar/pet`, { withCredentials: true }).subscribe({
      next: (response) => {
        console.log('Resposta de pets no agendamento:', response);
        this.pets = response.pets || response.Pets || [];
      },
      error: (err) => {
        console.error('Erro ao buscar pets do tutor no agendamento:', err);
      }
    });
  }

  buscarAgendamentosDoUsuario(): void {
    this.http.get<any>(`${environment.apiUrl}/consultas`, { withCredentials: true }).subscribe({
      next: (response) => {
        if (response && response.consultas) {
          this.agendamentos = response.consultas.map((c: any) => ({
            id_consulta: c.id_consulta,
            nome_pet: c.pet?.nome || 'Seu Pet',
            servico: c.funcionario?.especialidade === 'veterinario' ? 'Veterinário' : 'Tosador',
            data_consulta: c.data_consulta ? c.data_consulta.split('T')[0] : '',
            hora_inicio: c.hora_inicio,
            status: c.status,
            nome_funcionario: c.funcionario?.nome,
            observacoes: c.observacoes
          }));
        }
      },
      error: (err) => {
        if (err.status !== 404) {
          console.error('Erro ao buscar lista de consultas:', err);
        }
        this.agendamentos = [];
      }
    });
  }

  get agendamentosAtivos(): Agendamento[] {
    return this.agendamentos.filter(a => {
      if (!a.status) return false;
      const st = a.status.toLowerCase().trim();
      return st === 'em espera' || st === 'em_espera' || st === 'em andamento' || st === 'em_andamento';
    });
  }

  get historicoAgendamentos(): Agendamento[] {
    return this.agendamentos.filter(a => {
      if (!a.status) return false;
      const st = a.status.toLowerCase().trim();
      return st === 'finalizado' || st === 'cancelado';
    });
  }

  selecionarPet(pet: Pet): void {
    this.petSelecionadoId = pet.id_pet;
    this.petSelecionadoNome = pet.nome;
    this.mensagemErro = '';
  }

  selecionarServico(valor: string): void {
    this.servicoSelecionadoValor = valor;
    this.mensagemErro = '';
  }

  selecionarHorario(horario: string): void {
    if (this.horarioIndisponivel(horario)) {
      this.mensagemErro = 'Esse horário já passou no dia de hoje.';
      return;
    }
    this.horarioSelecionado = horario;
    this.mensagemErro = '';
  }

  aoAlterarData(): void {
    this.mensagemErro = '';
    this.horarioSelecionado = '';
    if (this.dataSelecionada && this.dataPassada()) {
      this.mensagemErro = 'Não é possível selecionar uma data passada.';
    }
  }

  continuar(): void {
    this.mensagemErro = '';
    if (!this.podeContinuar()) {
      this.mensagemErro = this.obterMensagemErro();
      return;
    }

    if (this.etapaAtual < 3) {
      this.etapaAtual++;
    } else if (this.etapaAtual === 3) {
      this.finalizarAgendamento();
    }
  }

  voltar(): void {
    this.mensagemErro = '';
    if (this.etapaAtual > 1) {
      this.etapaAtual--;
    }
  }

  podeContinuar(): boolean {
    if (this.etapaAtual === 1) return !!this.petSelecionadoId;
    if (this.etapaAtual === 2) return !!this.servicoSelecionadoValor;
    if (this.etapaAtual === 3) {
      return !!this.dataSelecionada && !!this.horarioSelecionado && !this.dataPassada() && !this.horarioIndisponivel(this.horarioSelecionado);
    }
    return true;
  }

  finalizarAgendamento(): void {
    this.mensagemErro = '';
    this.mensagemSucesso = '';

    const payload = {
      servico: this.servicoSelecionadoValor,
      id_pet: this.petSelecionadoId,
      data_consulta: this.dataSelecionada,
      hora_inicio: this.horarioSelecionado,
      observacoes: this.observacoes.trim()
    };

    this.carregando = true;

    this.http.post(`${environment.apiUrl}/agendamento`, payload, { withCredentials: true }).subscribe({
      next: (res: any) => {
        this.carregando = false;
        this.mensagemSucesso = res.mensagem || 'Consulta agendada com sucesso';
        this.etapaAtual = 4;
        this.buscarAgendamentosDoUsuario();
      },
      error: (err) => {
        this.carregando = false;
        console.error(err);
        this.mensagemErro = err.error?.mensagem || err.error || 'Erro ao efuar o agendamento no servidor.';
      }
    });
  }

  cancelarAgendamento(id: number): void {
    if (!confirm('Tem certeza que deseja cancelar essa consulta?')) return;

    this.http.delete(`${environment.apiUrl}/user/listar/pet/delete/${id}`).subscribe({
      next: () => {
        this.mensagemSucesso = 'Agendamento removido.';
        this.buscarAgendamentosDoUsuario();
      },
      error: (err) => {
        console.error(err);
        this.mensagemErro = 'Não foi possível cancelar o agendamento.';
      }
    });
  }

  dataPassada(): boolean {
    if (!this.dataSelecionada) return false;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const selecionada = new Date(this.dataSelecionada + 'T00:00:00');
    return selecionada < hoje;
  }

  dataEhHoje(): boolean {
    if (!this.dataSelecionada) return false;
    const hoje = new Date();
    const selecionada = new Date(this.dataSelecionada + 'T00:00:00');
    return selecionada.toDateString() === hoje.toDateString();
  }

  horarioIndisponivel(horario: string): boolean {
    if (!this.dataSelecionada || !this.dataEhHoje()) return false;
    const agora = new Date();
    const [hora, minuto] = horario.split(':').map(Number);
    const limite = new Date();
    limite.setHours(hora, minuto, 0, 0);
    return limite <= agora;
  }

  horarioJaOcupado(horario: string): boolean {
    if (!this.dataSelecionada) return false;

    return this.agendamentos.some(a => {
      const statusBaixo = a.status ? a.status.toLowerCase().trim() : '';
      const estaAtivo = statusBaixo === 'em espera' || statusBaixo === 'em_espera' || statusBaixo === 'em andamento' || statusBaixo === 'em_andamento';
      
      return estaAtivo && a.data_consulta === this.dataSelecionada && a.hora_inicio === horario;
    });
  }

  obterDataMinima(): string {
    const hoje = new Date();
    return hoje.toISOString().split('T')[0];
  }

  formatarData(data: string): string {
    if (!data) return '';
    const partes = data.split('-');
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  obterMensagemErro(): string {
    if (this.etapaAtual === 1) return 'Selecione um pet para prosseguir.';
    if (this.etapaAtual === 2) return 'Selecione um serviço clínico.';
    if (this.etapaAtual === 3) {
      if (!this.dataSelecionada) return 'Selecione a data.';
      if (!this.horarioSelecionado) return 'Escolha um horário válido.';
    }
    return 'Por favor, revise os campos obrigatórios.';
  }

  irParaCadastroPet(): void {
    this.router.navigate(['/user/listar/pet']);
  }

  limparFormulario(): void {
    this.etapaAtual = 1;
    this.petSelecionadoId = null;
    this.petSelecionadoNome = '';
    this.servicoSelecionadoValor = '';
    this.dataSelecionada = '';
    this.horarioSelecionado = '';
    this.observacoes = '';
    this.mensagemErro = '';
    this.mensagemSucesso = '';
  }
}