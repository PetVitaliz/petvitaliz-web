import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import {
  PlanId, ServiceId, ServiceInfo, SERVICES, PLAN_NAMES, PLAN_CORES, PREFIXO_SERVICO,
  planoDoPet, getServiceQuota, getMinimumPlan, getService, servicoDaConsulta
} from '../../../core/plan-coverage';

/** Situação de um serviço para um pet, de acordo com o plano. */
export interface SituacaoServico {
  servico: ServiceInfo;
  liberado: boolean;
  cota: number | 'ilimitado' | null;
  usado: number;
  motivo: string;   // texto curto mostrado no card
}

type Aba = 'tutores' | 'pets';

@Component({
  selector: 'app-clientes-funcionario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clientes-funcionario.component.html',
  styleUrl: './clientes-funcionario.component.css'
})
export class ClientesFuncionarioComponent implements OnInit {

  aba: Aba = 'tutores';

  clientes: any[] = [];
  pets: any[] = [];
  petSelecionado: any = null;
  filtroEspecie = 'Todos';
  carregandoPets = true;
  modalPetAberto = false;
  clienteSelecionado: any = null;
  historicoConsultas: any[] = [];

  searchTerm = '';
  statusFiltro = 'Todos';

  paginaAtual = 1;
  itensPorPagina = 8;

  carregando = true;
  carregandoHistorico = false;
  erroMensagem = '';
  erroAgendamento = '';
  toastMensagem = '';

  modalDetalhesAberto = false;
  modalAgendarAberto = false;

  // Agendamento (regras de plano iguais às do app mobile)
  readonly servicos = SERVICES;
  readonly nomesPlanos = PLAN_NAMES;
  readonly horarios = this.gerarHorarios();
  readonly datasDisponiveis = this.gerarDatas();

  /** Consultas já marcadas (usadas para cota do mês e horários ocupados) */
  consultasExistentes: any[] = [];
  horariosSemProfissional: string[] = [];

  agendarTutor = '';
  agendarPets: any[] = [];
  agendarPetId: any = null;
  servicoSelecionado: ServiceId | null = null;
  dataSelecionada = '';
  horaSelecionada = '';
  observacoesAgendamento = '';
  salvandoAgendamento = false;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      this.aba = params.get('aba') === 'pets' ? 'pets' : 'tutores';
      this.paginaAtual = 1;
    });
    this.buscarClientesDaAPI();
    this.carregarPetsDaAPI();
    this.carregarConsultasExistentes();
  }

  atualizarTudo(): void {
    this.buscarClientesDaAPI();
    this.carregarPetsDaAPI();
    this.carregarConsultasExistentes();
  }

  carregarConsultasExistentes(): void {
    this.http.get<any>(`${environment.apiUrl}/funcionario/consultas`, { withCredentials: true }).subscribe({
      next: (res) => {
        const lista = res?.consultas || res || [];
        this.consultasExistentes = Array.isArray(lista) ? lista : [];
      },
      error: (err) => console.error('Erro ao carregar consultas para as cotas:', err)
    });
  }

  // ---------- Planos ----------

  planoDoPet(pet: any): PlanId | null {
    return planoDoPet(pet);
  }

  nomePlano(pet: any): string {
    const id = planoDoPet(pet);
    return id ? PLAN_NAMES[id].replace('Plano ', '') : 'Sem plano';
  }

  corPlano(pet: any): string {
    const id = planoDoPet(pet);
    return id ? PLAN_CORES[id] : '#98a0b6';
  }

  get totalPetsComPlano(): number {
    return this.pets.filter(p => !!planoDoPet(p)).length;
  }

  private idDoPet(pet: any): any {
    return pet?.id_pet ?? pet?.id ?? null;
  }

  /** Quantas vezes o pet já usou o serviço neste mês (sem canceladas). */
  private consultasDoPet(pet: any): any[] {
    return Array.isArray(pet?.consultasDoMes) ? pet.consultasDoMes : this.consultasExistentes;
  }

  usoNoMes(pet: any, serviceId: ServiceId): number {
    const id = this.idDoPet(pet);
    const nome = String(pet?.nome || '').trim().toLowerCase();
    const agora = new Date();

    return this.consultasDoPet(pet).filter(c => {
      const status = String(c?.status || '').toLowerCase();
      if (status.includes('cancel')) return false;

      const mesmoPet = (id != null && (c.id_pet === id || c.pet?.id_pet === id))
        || (!!nome && String(c.pet?.nome || c.nome_pet || '').trim().toLowerCase() === nome);
      if (!mesmoPet) return false;

      const data = String(c.data_consulta || '').split('T')[0];
      const [ano, mes] = data.split('-').map(Number);
      if (ano !== agora.getFullYear() || mes !== agora.getMonth() + 1) return false;

      return servicoDaConsulta(c) === serviceId;
    }).length;
  }

  situacaoServico(pet: any, servico: ServiceInfo): SituacaoServico {
    const plano = planoDoPet(pet);
    const cota = getServiceQuota(plano, servico.id);
    const usado = this.usoNoMes(pet, servico.id);

    if (!plano) {
      return { servico, liberado: false, cota: null, usado, motivo: 'Pet sem plano' };
    }
    if (cota === null) {
      const minimo = getMinimumPlan(servico.id);
      return {
        servico, liberado: false, cota: null, usado,
        motivo: minimo ? `A partir do ${PLAN_NAMES[minimo].replace('Plano ', '')}` : 'Não disponível'
      };
    }
    if (cota === 'ilimitado') {
      return { servico, liberado: true, cota, usado, motivo: 'Ilimitado' };
    }
    if (usado >= cota) {
      return { servico, liberado: false, cota, usado, motivo: 'Cota esgotada · renova dia 1º' };
    }
    return { servico, liberado: true, cota, usado, motivo: `${usado} de ${cota} usados no mês` };
  }

  coberturaDoPet(pet: any): SituacaoServico[] {
    return this.servicos.map(s => this.situacaoServico(pet, s));
  }

  definirAba(aba: Aba): void {
    this.router.navigate([], { relativeTo: this.route, queryParams: { aba: aba === 'pets' ? 'pets' : null } });
  }

  carregarPetsDaAPI(): void {
    this.carregandoPets = true;
    this.http.get<any>(`${environment.apiUrl}/funcionario/pets`, { withCredentials: true })
      .subscribe({
        next: (res) => {
          this.carregandoPets = false;
          const lista = res.pets || res || [];
          this.pets = Array.isArray(lista) ? lista : [];
        },
        error: (err) => {
          this.carregandoPets = false;
          console.error('Erro ao buscar pets:', err);
          this.erroMensagem = 'Não foi possível carregar os pets.';
        }
      });
  }

  // ---------- Pets ----------

  private filtrarPetsPorTexto(): any[] {
    const termo = this.searchTerm.toLowerCase().trim();
    if (!termo) return this.pets;
    return this.pets.filter(pet =>
      [pet.nome, pet.tutor, pet.especie, pet.detalheEspecie]
        .some((valor: any) => String(valor || '').toLowerCase().includes(termo))
    );
  }

  get especiesDisponiveis(): string[] {
    const especies = new Set<string>(this.pets.map(p => p.especie).filter(Boolean));
    return ['Todos', ...Array.from(especies).sort((a, b) => a.localeCompare(b, 'pt-BR'))];
  }

  contarEspecie(especie: string): number {
    const base = this.filtrarPetsPorTexto();
    return especie === 'Todos' ? base.length : base.filter(p => p.especie === especie).length;
  }

  get petsFiltrados(): any[] {
    return this.filtrarPetsPorTexto()
      .filter(pet => this.filtroEspecie === 'Todos' || pet.especie === this.filtroEspecie)
      .sort((a, b) => String(a.nome || '').localeCompare(String(b.nome || ''), 'pt-BR'));
  }

  definirEspecie(especie: string): void {
    this.filtroEspecie = especie;
    this.paginaAtual = 1;
  }

  /** Pets de um tutor (cruza o endpoint de pets pelo nome; usa a lista do tutor como reserva) */
  petsDoTutor(cliente: any): any[] {
    if (!cliente) return [];
    const daApi = this.pets.filter(p => p.tutor && cliente.nome && String(p.tutor).trim().toLowerCase() === String(cliente.nome).trim().toLowerCase());
    return daApi.length > 0 ? daApi : (cliente.petsDetalhesLista || []);
  }

  /** Abre a aba Pets já filtrada por um tutor */
  verPetsDoTutor(cliente: any): void {
    this.searchTerm = cliente.nome || '';
    this.filtroEspecie = 'Todos';
    this.definirAba('pets');
  }

  abrirPet(pet: any): void {
    this.petSelecionado = pet;
    this.modalPetAberto = true;
  }

  fecharPet(): void {
    this.modalPetAberto = false;
    this.petSelecionado = null;
  }

  tutorDoPet(pet: any): any {
    return this.clientes.find(c => String(c.nome || '').trim().toLowerCase() === String(pet?.tutor || '').trim().toLowerCase()) || null;
  }

  abrirTutorDoPet(pet: any): void {
    const tutor = this.tutorDoPet(pet);
    if (!tutor) return;
    this.fecharPet();
    this.abrirDetalhes(tutor);
  }

  buscarClientesDaAPI(): void {
    this.carregando = true;
    this.erroMensagem = '';
    this.http.get<any>(`${environment.apiUrl}/funcionario/clientes`, { withCredentials: true })
      .subscribe({
        next: (res) => {
          this.carregando = false;
          const rawClientes = res.clientes || res.Clientes || res || [];

          this.clientes = (Array.isArray(rawClientes) ? rawClientes : []).map((c: any) => ({
            ...c,
            id_usuario: c.id_usuario || c.id,
            status: c.status || 'ATIVO',
            ultimaVisita: 'Consultar histórico',
            petsLista: Array.isArray(c.petsLista) ? c.petsLista : [],
            petsDetalhesLista: Array.isArray(c.petsDetalhesLista) ? c.petsDetalhesLista : []
          }));
        },
        error: (err) => {
          this.carregando = false;
          console.error('Erro ao buscar tutores do banco:', err);
          this.erroMensagem = 'Não foi possível carregar os clientes.';
        }
      });
  }

  // ---------- Filtros ----------

  private filtrarPorTexto(): any[] {
    const termo = this.searchTerm.toLowerCase().trim();
    if (!termo) return this.clientes;

    return this.clientes.filter(cliente =>
      [cliente.nome, cliente.cpf, cliente.telefone, cliente.email, ...(cliente.petsLista || [])]
        .some((valor: any) => String(valor || '').toLowerCase().includes(termo))
    );
  }

  get clientesFiltrados(): any[] {
    return this.filtrarPorTexto()
      .filter(cliente => this.statusFiltro === 'Todos' || cliente.status === this.statusFiltro)
      .sort((a, b) => String(a.nome || '').localeCompare(String(b.nome || ''), 'pt-BR'));
  }

  contarStatus(status: string): number {
    const base = this.filtrarPorTexto();
    return status === 'Todos' ? base.length : base.filter(c => c.status === status).length;
  }

  get totalAtivos(): number {
    return this.clientes.filter(c => c.status === 'ATIVO').length;
  }

  get totalInativos(): number {
    return this.clientes.filter(c => c.status === 'INATIVO').length;
  }

  get totalPets(): number {
    return this.clientes.reduce((total, cliente) => total + Number(cliente.pets || 0), 0);
  }

  definirStatus(status: string): void {
    this.statusFiltro = status;
    this.paginaAtual = 1;
  }

  aoBuscar(): void {
    this.paginaAtual = 1;
  }

  limparBusca(): void {
    this.searchTerm = '';
    this.statusFiltro = 'Todos';
    this.filtroEspecie = 'Todos';
    this.paginaAtual = 1;
  }

  // ---------- Paginação ----------

  private get totalItens(): number { return this.aba === 'pets' ? this.petsFiltrados.length : this.clientesFiltrados.length; }
  get totalPaginas(): number { return Math.max(Math.ceil(this.totalItens / this.itensPorPagina), 1); }
  get paginas(): number[] { return Array.from({ length: this.totalPaginas }, (_, i) => i + 1); }
  get clientesPaginados(): any[] {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    return this.clientesFiltrados.slice(inicio, inicio + this.itensPorPagina);
  }

  get petsPaginados(): any[] {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    return this.petsFiltrados.slice(inicio, inicio + this.itensPorPagina);
  }

  mudarPagina(p: number): void { this.paginaAtual = p; }

  // ---------- Apresentação ----------

  inicialCliente(cliente: any): string {
    if (!cliente || !cliente.nome) return 'C';
    const partes = String(cliente.nome).trim().split(/\s+/);
    const primeira = partes[0]?.charAt(0) || 'C';
    const ultima = partes.length > 1 ? partes[partes.length - 1].charAt(0) : '';
    return (primeira + ultima).toUpperCase();
  }

  statusPill(status: string): string {
    return status === 'INATIVO' ? 'pill-danger' : 'pill-ok';
  }

  statusRotulo(status: string): string {
    return status === 'INATIVO' ? 'Inativo' : 'Ativo';
  }

  /**
   * Descobre a espécie do pet (mesma regra do admin). Olha a espécie e a raça,
   * porque a API às vezes manda "Outro" com a raça "Répteis", por exemplo.
   */
  especieDoPet(pet: any): string {
    const texto = (typeof pet === 'string' ? pet : `${pet?.especie || ''} ${pet?.detalheEspecie || ''} ${pet?.raca || ''}`)
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

    if (/\b(cao|caes|cachorr|canin|dog)/.test(texto)) return 'Cão';
    if (/\b(gat|felin|cat)/.test(texto)) return 'Gato';
    if (/\b(ave|aves|passaro|calopsita|periquito|papagaio|bird)/.test(texto)) return 'Ave';
    if (/\b(coelh|rabbit)/.test(texto)) return 'Coelho';
    if (/\b(reptil|repteis|tartaruga|jabuti|lagart|cobra|iguana|serpente)/.test(texto)) return 'Réptil';
    return 'Outro';
  }

  classeEspecie(especie: string): string {
    const mapa: Record<string, string> = {
      'Cão': 'esp-cao', 'Gato': 'esp-gato', 'Ave': 'esp-ave',
      'Coelho': 'esp-coelho', 'Réptil': 'esp-reptil'
    };
    return mapa[especie] || 'esp-outro';
  }

  petStatusPill(status: string): string {
    const st = String(status || '').toLowerCase();
    if (st.includes('trat')) return 'pill-warn';
    if (st.includes('ativo')) return 'pill-ok';
    return 'pill-muted';
  }

  sexoRotulo(sexo: string): string {
    const s = String(sexo || '').toUpperCase();
    if (s.startsWith('M')) return 'Macho';
    if (s.startsWith('F')) return 'Fêmea';
    return sexo || 'Não informado';
  }

  statusConsultaPill(status: string): string {
    const st = String(status || '').toLowerCase();
    if (st.includes('final')) return 'pill-ok';
    if (st.includes('andamento') || st.includes('endamento')) return 'pill-info';
    if (st.includes('espera')) return 'pill-warn';
    return 'pill-muted';
  }

  statusConsultaRotulo(status: string): string {
    const st = String(status || '').toLowerCase();
    if (st.includes('final')) return 'Finalizada';
    if (st.includes('andamento') || st.includes('endamento')) return 'Em atendimento';
    if (st.includes('espera')) return 'Em espera';
    return status || 'Agendada';
  }

  // ---------- Histórico ----------

  abrirDetalhes(cliente: any): void {
    this.clienteSelecionado = cliente;
    this.historicoConsultas = [];
    this.carregandoHistorico = true;
    this.modalDetalhesAberto = true;

    this.http.get<any>(`${environment.apiUrl}/funcionario/consultas`, { withCredentials: true })
      .subscribe({
        next: (res) => {
          this.carregandoHistorico = false;
          const todas = res.consultas || res.Consultas || res || [];

          this.historicoConsultas = (Array.isArray(todas) ? todas : []).filter((c: any) => {
            if (!c) return false;
            const nomeDoPetDaConsulta = c.pet && typeof c.pet === 'object' ? c.pet.nome : c.pet;
            const nomeAlternativo = c.nome_pet || c.pet_nome || '';

            return (
              cliente.petsLista.includes(nomeDoPetDaConsulta) ||
              cliente.petsLista.includes(nomeAlternativo)
            );
          });
        },
        error: (err) => {
          this.carregandoHistorico = false;
          console.error('Erro ao carregar histórico médico:', err);
        }
      });
  }

  fecharDetalhes(): void {
    this.modalDetalhesAberto = false;
    this.clienteSelecionado = null;
    this.historicoConsultas = [];
  }

  // ---------- Agendamento ----------

  /** Agendar a partir de um tutor: escolhe entre os pets dele */
  agendarConsulta(cliente: any): void {
    const pets = this.petsDoTutor(cliente).filter((p: any) => typeof p === 'object');
    this.abrirAgendar(cliente.nome, pets);
  }

  /** Agendar a partir de um pet: pet já vem escolhido */
  agendarParaPet(pet: any): void {
    this.abrirAgendar(pet.tutor || 'Tutor', [pet]);
  }

  private abrirAgendar(tutor: string, pets: any[]): void {
    this.erroAgendamento = '';
    this.modalDetalhesAberto = false;
    this.modalPetAberto = false;
    this.agendarTutor = tutor;
    this.agendarPets = pets;
    // Começa pelo primeiro pet com plano, se houver
    const inicial = pets.find(p => !!planoDoPet(p)) || pets[0];
    this.agendarPetId = inicial ? this.idDoPet(inicial) ?? inicial.nome : null;
    this.limparEscolhas();
    this.modalAgendarAberto = true;
  }

  get petAgendamento(): any {
    return this.agendarPets.find(p => (this.idDoPet(p) ?? p.nome) === this.agendarPetId) || null;
  }

  trocarPetAgendamento(): void {
    this.limparEscolhas();
  }

  private limparEscolhas(): void {
    this.servicoSelecionado = null;
    this.dataSelecionada = '';
    this.horaSelecionada = '';
    this.observacoesAgendamento = '';
    this.erroAgendamento = '';
    this.horariosSemProfissional = [];
  }

  escolherServico(situacao: SituacaoServico): void {
    if (!situacao.liberado) return;
    this.servicoSelecionado = situacao.servico.id;
    this.erroAgendamento = '';
    this.buscarDisponibilidade();
  }

  buscarDisponibilidade(): void {
    this.horariosSemProfissional = [];
    if (!this.servicoSelecionado || !this.dataSelecionada) return;

    const servico = getService(this.servicoSelecionado).servicoApi;
    const data = this.dataSelecionada;
    const params = new HttpParams().set('servico', servico).set('data', data);
    this.http.get<any>(`${environment.apiUrl}/funcionario/agendamento/horarios`, { params, withCredentials: true }).subscribe({
      next: (res) => {
        if (!this.servicoSelecionado || getService(this.servicoSelecionado).servicoApi !== servico || this.dataSelecionada !== data) return;
        this.horariosSemProfissional = res?.profissionais === 0 ? [...this.horarios] : (res?.indisponiveis || []);
        if (this.horaSelecionada && this.horarioOcupado(this.horaSelecionada)) {
          this.horaSelecionada = '';
        }
      },
      error: () => {
        this.horariosSemProfissional = [];
      }
    });
  }

  escolherData(data: string): void {
    this.dataSelecionada = data;
    if (this.horaSelecionada && this.horarioOcupado(this.horaSelecionada)) {
      this.horaSelecionada = '';
    }
    this.buscarDisponibilidade();
  }

  /** Horário sem profissional livre para o serviço ou em que o pet já tem consulta. */
  horarioOcupado(hora: string): boolean {
    if (!this.dataSelecionada) return false;
    if (this.horariosSemProfissional.includes(hora)) return true;
    const pet = this.petAgendamento;
    const idPet = this.idDoPet(pet);
    return this.consultasDoPet(pet).some(c => {
      const status = String(c?.status || '').toLowerCase();
      if (status.includes('cancel') || status.includes('final')) return false;
      if (idPet != null && c.id_pet != null && c.id_pet !== idPet) return false;
      const data = String(c.data_consulta || '').split('T')[0];
      const horaC = String(c.hora_inicio || '').slice(0, 5);
      return data === this.dataSelecionada && horaC === hora;
    });
  }

  get podeConfirmar(): boolean {
    return !!this.petAgendamento && !!planoDoPet(this.petAgendamento)
      && !!this.servicoSelecionado && !!this.dataSelecionada && !!this.horaSelecionada
      && !this.salvandoAgendamento;
  }

  get resumoAgendamento(): string {
    if (!this.servicoSelecionado || !this.dataSelecionada || !this.horaSelecionada) return '';
    return `${getService(this.servicoSelecionado).nome} · ${this.rotuloData(this.dataSelecionada)} às ${this.horaSelecionada}`;
  }

  fecharAgendar(): void {
    this.modalAgendarAberto = false;
  }

  salvarAgendamento(): void {
    const pet = this.petAgendamento;
    if (!pet || !this.servicoSelecionado || !this.dataSelecionada || !this.horaSelecionada) {
      this.erroAgendamento = 'Escolha o serviço, a data e o horário.';
      return;
    }

    // Confere as regras de novo antes de enviar
    const situacao = this.situacaoServico(pet, getService(this.servicoSelecionado));
    if (!situacao.liberado) {
      this.erroAgendamento = `Não é possível agendar: ${situacao.motivo.toLowerCase()}.`;
      return;
    }

    const idPet = this.idDoPet(pet);
    if (idPet == null) {
      this.erroAgendamento = 'Este pet veio sem identificador da API (id_pet). Não dá para agendar.';
      return;
    }

    const servico = getService(this.servicoSelecionado);
    const obs = this.observacoesAgendamento.trim();
    const payload = {
      servico: servico.servicoApi,
      tipo_servico: servico.id,
      id_pet: idPet,
      data_consulta: this.dataSelecionada,
      hora_inicio: this.horaSelecionada,
      // O prefixo permite contar a cota do serviço certo depois
      observacoes: `${PREFIXO_SERVICO}${servico.nome}.${obs ? ' ' + obs : ''}`
    };

    this.salvandoAgendamento = true;
    this.erroAgendamento = '';
    this.http.post<any>(`${environment.apiUrl}/funcionario/agendamento`, payload, { withCredentials: true }).subscribe({
      next: (res) => {
        this.salvandoAgendamento = false;
        this.fecharAgendar();
        this.mostrarToast(res?.mensagem || `${servico.nome} agendado para ${pet.nome}.`);
        this.carregarConsultasExistentes();
        this.carregarPetsDaAPI();
      },
      error: (err) => {
        this.salvandoAgendamento = false;
        console.error('Erro ao agendar:', err);
        if (err.status === 401 || err.status === 403) {
          this.erroAgendamento = 'Sua sessão expirou. Entre novamente para agendar.';
        } else {
          this.erroAgendamento = err.error?.mensagem || 'Não foi possível salvar o agendamento.';
          if (err.status === 409) this.buscarDisponibilidade();
        }
      }
    });
  }

  rotuloData(iso: string): string {
    const d = new Date(iso + 'T00:00:00');
    const semana = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
    return `${semana} ${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
  }

  /** Próximos 14 dias, sem domingos (regra do app mobile). */
  private gerarDatas(): string[] {
    const lista: string[] = [];
    const base = new Date();
    for (let i = 1; i <= 14; i += 1) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      if (d.getDay() !== 0) {
        lista.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
      }
    }
    return lista;
  }

  /** 08:00 às 20:00, de 30 em 30 minutos (mesma grade do site do tutor). */
  private gerarHorarios(): string[] {
    const lista: string[] = [];
    for (let min = 8 * 60; min <= 20 * 60; min += 30) {
      lista.push(`${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`);
    }
    return lista;
  }

  private mostrarToast(mensagem: string): void {
    this.toastMensagem = mensagem;
    setTimeout(() => (this.toastMensagem = ''), 3000);
  }

  formatarDataParaExibicao(data: string): string {
    if (!data) return 'Data indefinida';
    const partes = data.split('T')[0].split('-');
    if (partes.length !== 3) return data;

    const meses: any = {
      '01': 'Jan', '02': 'Fev', '03': 'Mar', '04': 'Abr', '05': 'Mai', '06': 'Jun',
      '07': 'Jul', '08': 'Ago', '09': 'Set', '10': 'Out', '11': 'Nov', '12': 'Dez'
    };

    return `${partes[2]} ${meses[partes[1]]} ${partes[0]}`;
  }
}