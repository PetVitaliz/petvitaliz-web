import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { IconePetComponent } from '../../../components/icone-pet/icone-pet.component';
import {
  PLAN_CORES, PLAN_NAMES, PREFIXO_SERVICO, PlanId, Quota, SERVICES, ServiceId, ServiceInfo,
  getMinimumPlan, getPlanId, getServiceQuota, servicoDaConsulta
} from '../../../core/plan-coverage';

interface Pet {
  id_pet: number;
  nome: string;
  especie: string;
  foto_url: string | null;
}

interface Consulta {
  id_consulta: number;
  id_pet: number | null;
  nome_pet: string;
  servicoId: ServiceId;
  data_consulta: string;
  hora_inicio: string;
  status: string;
  nome_funcionario?: string;
}

type EstadoServico = 'liberado' | 'esgotado' | 'fora';

// Ilustrações dos serviços (as mesmas da home)
const IMAGENS: Record<ServiceId, string> = {
  consulta: 'assets/img/servicos/consultas.svg',
  vacinacao: 'assets/img/servicos/vacinacao.svg',
  exames: 'assets/img/servicos/exames.svg',
  emergencia: 'assets/img/servicos/emergencia.svg',
  banho_tosa: 'assets/img/servicos/banho.svg',
  leva_busca: 'assets/img/servicos/leva-traz.svg'
};

@Component({
  selector: 'app-agendamento',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IconePetComponent],
  templateUrl: './agendamento.component.html',
  styleUrl: './agendamento.component.css'
})
export class AgendamentoComponent implements OnInit {

  readonly nomesEtapas = ['Pet', 'Serviço', 'Data e horário', 'Confirmação'];
  readonly servicos = SERVICES;
  readonly imagens = IMAGENS;
  readonly nomesPlanos = PLAN_NAMES;
  readonly coresPlanos = PLAN_CORES;

  etapaAtual = 1;
  carregandoDados = true;

  pets: Pet[] = [];
  planosPorPet: Record<number, PlanId> = {};
  consultas: Consulta[] = [];

  horarios: string[] = [];

  petSelecionado: Pet | null = null;
  servicoSelecionado: ServiceInfo | null = null;
  dataSelecionada = '';
  horarioSelecionado = '';
  observacoes = '';

  mensagemErro = '';
  mensagemSucesso = '';
  carregando = false;

  horariosSemProfissional: string[] = [];
  semProfissionais = false;
  carregandoHorarios = false;

  private petDaUrl: number | null = null;

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute) {
    this.gerarGradeHorarios();
  }

  ngOnInit(): void {
    const pet = Number(this.route.snapshot.queryParamMap.get('pet'));
    this.petDaUrl = pet > 0 ? pet : null;
    this.carregarDados();
  }

  // ---------- Dados ----------

  private carregarDados(): void {
    const opcoes = { withCredentials: true };
    forkJoin({
      pets: this.http.get<any>(`${environment.apiUrl}/user/listar/pet`, opcoes).pipe(catchError(() => of(null))),
      planos: this.http.get<any>(`${environment.apiUrl}/user/planos`, opcoes).pipe(catchError(() => of(null))),
      consultas: this.http.get<any>(`${environment.apiUrl}/consultas`, opcoes).pipe(catchError(() => of(null)))
    }).subscribe(({ pets, planos, consultas }) => {
      this.pets = pets?.pets || pets?.Pets || [];

      this.planosPorPet = {};
      (planos?.planos || []).forEach((p: any) => {
        const id = getPlanId(p.produto?.nome);
        if (id) this.planosPorPet[p.id_pet] = id;
      });

      this.lerConsultas(consultas);
      this.carregandoDados = false;

      // Pet escolhido em "Meus pets" (?pet=id) já vem selecionado
      const doLink = this.pets.find((p) => p.id_pet === this.petDaUrl);
      if (doLink && this.planoDe(doLink)) {
        this.selecionarPet(doLink);
      } else if (this.petsComPlano.length === 1) {
        this.selecionarPet(this.petsComPlano[0]);
      }
    });
  }

  private lerConsultas(resposta: any): void {
    this.consultas = (resposta?.consultas || []).map((c: any) => ({
      id_consulta: c.id_consulta,
      id_pet: c.id_pet ?? c.pet?.id_pet ?? null,
      nome_pet: c.pet?.nome || 'Seu pet',
      servicoId: servicoDaConsulta(c),
      data_consulta: c.data_consulta ? String(c.data_consulta).split('T')[0] : '',
      hora_inicio: c.hora_inicio ? String(c.hora_inicio).slice(0, 5) : '',
      status: String(c.status || '').toLowerCase().replace('_', ' ').trim(),
      nome_funcionario: c.funcionario?.nome
    }));
  }

  private recarregarConsultas(): void {
    this.http.get<any>(`${environment.apiUrl}/consultas`, { withCredentials: true })
      .pipe(catchError(() => of(null)))
      .subscribe((r) => this.lerConsultas(r));
  }

  // ---------- Planos e cotas ----------

  planoDe(pet: Pet | null): PlanId | null {
    return pet ? this.planosPorPet[pet.id_pet] ?? null : null;
  }

  get petsComPlano(): Pet[] {
    return this.pets.filter((p) => this.planoDe(p));
  }

  get planoAtual(): PlanId | null {
    return this.planoDe(this.petSelecionado);
  }

  private ehCancelada(c: Consulta): boolean {
    return c.status.includes('cancel');
  }

  private ehDoPet(c: Consulta, pet: Pet): boolean {
    return c.id_pet !== null ? c.id_pet === pet.id_pet : c.nome_pet.toLowerCase() === pet.nome.toLowerCase();
  }

  // Quantas vezes o serviço já foi usado neste mês (a cota renova no dia 1º; canceladas não contam)
  usadosNoMes(servico: ServiceId): number {
    const pet = this.petSelecionado;
    if (!pet) return 0;
    const hoje = new Date();
    const mes = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
    return this.consultas.filter((c) =>
      this.ehDoPet(c, pet) && !this.ehCancelada(c) && c.servicoId === servico && c.data_consulta.startsWith(mes)
    ).length;
  }

  cota(servico: ServiceId): Quota | null {
    return getServiceQuota(this.planoAtual, servico);
  }

  estado(servico: ServiceId): EstadoServico {
    const cota = this.cota(servico);
    if (cota === null) return 'fora';
    if (cota === 'ilimitado') return 'liberado';
    return this.usadosNoMes(servico) >= cota ? 'esgotado' : 'liberado';
  }

  textoCota(servico: ServiceId): string {
    const cota = this.cota(servico);
    if (cota === null) {
      const minimo = getMinimumPlan(servico);
      return minimo ? `A partir do ${PLAN_NAMES[minimo]}` : 'Não disponível';
    }
    if (cota === 'ilimitado') return 'Ilimitado';
    const restam = Math.max(0, cota - this.usadosNoMes(servico));
    if (restam === 0) return 'Cota do mês usada · renova dia 1º';
    return `${restam} de ${cota} ${cota === 1 ? 'disponível' : 'disponíveis'} este mês`;
  }

  // ---------- Seleções ----------

  selecionarPet(pet: Pet): void {
    if (!this.planoDe(pet)) return;
    if (this.petSelecionado?.id_pet !== pet.id_pet) {
      this.servicoSelecionado = null;
      this.horarioSelecionado = '';
    }
    this.petSelecionado = pet;
    this.mensagemErro = '';
  }

  selecionarServico(s: ServiceInfo): void {
    if (this.estado(s.id) !== 'liberado') return;
    this.servicoSelecionado = s;
    this.mensagemErro = '';
    this.horarioSelecionado = '';
    this.buscarDisponibilidade();
  }

  selecionarHorario(horario: string): void {
    if (this.horarioIndisponivel(horario) || this.horarioSemProfissional(horario) || this.horarioJaOcupado(horario)) return;
    this.horarioSelecionado = horario;
    this.mensagemErro = '';
  }

  aoAlterarData(): void {
    this.mensagemErro = '';
    this.horarioSelecionado = '';
    if (this.dataSelecionada && this.dataPassada()) {
      this.mensagemErro = 'Não é possível escolher uma data que já passou.';
    }
    this.buscarDisponibilidade();
  }

  // ---------- Horários ----------

  private gerarGradeHorarios(): void {
    const lista: string[] = [];
    for (let m = 8 * 60; m <= 20 * 60; m += 30) {
      lista.push(`${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`);
    }
    this.horarios = lista;
  }

  buscarDisponibilidade(): void {
    this.horariosSemProfissional = [];
    this.semProfissionais = false;
    if (!this.servicoSelecionado || !this.dataSelecionada || this.dataPassada()) return;

    const servico = this.servicoSelecionado.servicoApi;
    const data = this.dataSelecionada;
    const params = new HttpParams().set('servico', servico).set('data', data);
    this.carregandoHorarios = true;
    this.http.get<any>(`${environment.apiUrl}/agendamento/horarios`, { params, withCredentials: true }).subscribe({
      next: (res) => {
        if (servico !== this.servicoSelecionado?.servicoApi || data !== this.dataSelecionada) return;
        this.horariosSemProfissional = res?.indisponiveis || [];
        this.semProfissionais = (res?.profissionais ?? 1) === 0;
        if (this.horarioSelecionado && this.horarioSemProfissional(this.horarioSelecionado)) {
          this.horarioSelecionado = '';
        }
        this.carregandoHorarios = false;
      },
      error: () => (this.carregandoHorarios = false)
    });
  }

  horarioSemProfissional(horario: string): boolean {
    return this.semProfissionais || this.horariosSemProfissional.includes(horario);
  }

  horarioJaOcupado(horario: string): boolean {
    const pet = this.petSelecionado;
    if (!pet || !this.dataSelecionada) return false;
    return this.consultas.some((c) =>
      this.ehDoPet(c, pet) && !this.ehCancelada(c) && !c.status.includes('finaliz')
      && c.data_consulta === this.dataSelecionada && c.hora_inicio === horario
    );
  }

  horarioBloqueado(horario: string): boolean {
    return this.horarioIndisponivel(horario) || this.horarioJaOcupado(horario) || this.horarioSemProfissional(horario);
  }

  dataPassada(): boolean {
    if (!this.dataSelecionada) return false;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    return new Date(this.dataSelecionada + 'T00:00:00') < hoje;
  }

  private dataEhHoje(): boolean {
    return !!this.dataSelecionada && new Date(this.dataSelecionada + 'T00:00:00').toDateString() === new Date().toDateString();
  }

  horarioIndisponivel(horario: string): boolean {
    if (!this.dataEhHoje()) return false;
    const [h, m] = horario.split(':').map(Number);
    const limite = new Date();
    limite.setHours(h, m, 0, 0);
    return limite <= new Date();
  }

  obterDataMinima(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  // ---------- Etapas ----------

  podeContinuar(): boolean {
    if (this.etapaAtual === 1) return !!this.petSelecionado;
    if (this.etapaAtual === 2) return !!this.servicoSelecionado && this.estado(this.servicoSelecionado.id) === 'liberado';
    if (this.etapaAtual === 3) {
      return !!this.dataSelecionada && !!this.horarioSelecionado && !this.dataPassada() && !this.horarioBloqueado(this.horarioSelecionado);
    }
    return true;
  }

  continuar(): void {
    this.mensagemErro = '';
    if (!this.podeContinuar()) {
      this.mensagemErro = this.etapaAtual === 1 ? 'Escolha um pet com plano.'
        : this.etapaAtual === 2 ? 'Escolha um serviço coberto pelo plano.'
        : !this.dataSelecionada ? 'Escolha a data.' : 'Escolha um horário disponível.';
      return;
    }
    if (this.etapaAtual < 3) {
      this.etapaAtual++;
    } else {
      this.finalizarAgendamento();
    }
  }

  voltar(): void {
    this.mensagemErro = '';
    if (this.etapaAtual > 1) this.etapaAtual--;
  }

  finalizarAgendamento(): void {
    if (!this.petSelecionado || !this.servicoSelecionado) return;

    // Confere de novo o plano e a cota antes de enviar
    if (this.estado(this.servicoSelecionado.id) !== 'liberado') {
      this.mensagemErro = 'Esse serviço não está disponível no plano deste pet.';
      this.etapaAtual = 2;
      return;
    }

    const extra = this.observacoes.trim();
    const payload = {
      servico: this.servicoSelecionado.servicoApi,
      id_pet: this.petSelecionado.id_pet,
      data_consulta: this.dataSelecionada,
      hora_inicio: this.horarioSelecionado,
      // O serviço vai no começo das observações para a cota do mês ser contada certinho
      observacoes: `${PREFIXO_SERVICO}${this.servicoSelecionado.nome}.${extra ? ' ' + extra : ''}`
    };

    this.carregando = true;
    this.mensagemErro = '';
    this.http.post(`${environment.apiUrl}/agendamento`, payload, { withCredentials: true }).subscribe({
      next: (res: any) => {
        this.carregando = false;
        this.mensagemSucesso = res?.mensagem || 'Consulta agendada com sucesso.';
        this.etapaAtual = 4;
        this.recarregarConsultas();
      },
      error: (err) => {
        this.carregando = false;
        this.mensagemErro = err.error?.mensagem || 'Não foi possível agendar agora. Tente de novo.';
        if (err.status === 409) this.buscarDisponibilidade();
      }
    });
  }

  novoAgendamento(): void {
    this.etapaAtual = 1;
    this.servicoSelecionado = null;
    this.dataSelecionada = '';
    this.horarioSelecionado = '';
    this.observacoes = '';
    this.mensagemErro = '';
    this.mensagemSucesso = '';
    if (this.petsComPlano.length !== 1) this.petSelecionado = null;
  }

  // ---------- Listas ----------

  get proximas(): Consulta[] {
    return this.consultas
      .filter((c) => c.status.includes('espera') || c.status.includes('andamento'))
      .sort((a, b) => (a.data_consulta + a.hora_inicio).localeCompare(b.data_consulta + b.hora_inicio));
  }

  get historico(): Consulta[] {
    return this.consultas
      .filter((c) => c.status.includes('finaliz') || c.status.includes('cancel'))
      .sort((a, b) => (b.data_consulta + b.hora_inicio).localeCompare(a.data_consulta + a.hora_inicio));
  }

  nomeServico(id: ServiceId): string {
    return SERVICES.find((s) => s.id === id)?.nome || 'Consulta';
  }

  podeCancelar(c: Consulta): boolean {
    return c.status.includes('espera');
  }

  cancelarAgendamento(c: Consulta): void {
    if (!confirm(`Cancelar ${this.nomeServico(c.servicoId).toLowerCase()} de ${c.nome_pet} em ${this.formatarData(c.data_consulta)} às ${c.hora_inicio}?`)) return;
    this.http.delete(`${environment.apiUrl}/user/agendamento/cancelar/${c.id_consulta}`, { withCredentials: true }).subscribe({
      next: () => {
        this.mensagemSucesso = 'Consulta cancelada.';
        this.recarregarConsultas();
      },
      error: (err) => (this.mensagemErro = err.error?.mensagem || 'Não foi possível cancelar a consulta.')
    });
  }

  formatarData(data: string): string {
    if (!data) return '';
    const [a, m, d] = data.split('-');
    return `${d}/${m}/${a}`;
  }

  diaDaSemana(data: string): string {
    if (!data) return '';
    // só o mês abreviado ("nov"), para caber na caixinha da data
    return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
  }

  formatarStatus(status: string): string {
    return status ? status.charAt(0).toUpperCase() + status.slice(1) : '';
  }
}
