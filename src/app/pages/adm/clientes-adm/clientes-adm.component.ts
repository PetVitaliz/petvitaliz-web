import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface ClienteAdm {
  id_pet?: number;
  nome: string;
  pet: string;
  idade: string;
  tutor: string;
  telefone: string;
  status: 'Ativo' | 'Em tratamento' | 'Inativo';
  especie: 'Cão' | 'Gato';
  observacoes?: string;
}

interface ConsultaAdm {
  data: string;
  horario: string;
  veterinario: string;
  procedimento: string;
  observacao: string;
}

@Component({
  selector: 'app-clientes-adm',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clientes-adm.component.html',
  styleUrl: './clientes-adm.component.css'
})
export class ClientesAdmComponent implements OnInit {

  busca = '';
  especie = 'Todas';
  status = 'Todos';

  paginaAtual = 1;
  itensPorPagina = 6;

  modalClienteAberto = false;
  modalProntuarioAberto = false;
  modalAgendarAberto = false;

  modoEdicao = false;
  clienteSelecionado: ClienteAdm | null = null;

  novoCliente: ClienteAdm = this.criarClienteVazio();
  novaConsulta: ConsultaAdm = this.criarConsultaVazia();

  clientes: ClienteAdm[] = [];
  carregando = false;

  clienteParaExcluir: ClienteAdm | null = null;
  toast: { texto: string; tipo: 'ok' | 'erro' } | null = null;
  private toastTimer: any;

  readonly filtrosStatus = ['Todos', 'Ativo', 'Em tratamento', 'Inativo'];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.carregarClientesDoBanco();
  }

  carregarClientesDoBanco(): void {
    this.carregando = true;
    this.http.get<any>(`${environment.apiUrl}/adm/listar/clientes`, { withCredentials: true }).subscribe({
      next: (res) => {
        if (res && res.clientes) {
          this.clientes = res.clientes;
        }
        this.carregando = false;
      },
      error: (err) => {
        console.error('Erro ao buscar diretório de clientes:', err);
        this.carregando = false;
      }
    });
  }

  criarClienteVazio(): ClienteAdm {
    return {
      nome: '',
      pet: '',
      idade: '',
      tutor: '',
      telefone: '',
      status: 'Ativo',
      especie: 'Cão'
    };
  }

  criarConsultaVazia(): ConsultaAdm {
    return {
      data: '',
      horario: '',
      veterinario: 'Dr. Ricardo Silva',
      procedimento: 'Consulta de Rotina',
      observacao: ''
    };
  }

  obterInicial(nome: string): string {
    if (!nome || !nome.trim()) return '?';
    return nome.trim().charAt(0).toUpperCase();
  }

  get clientesFiltrados(): ClienteAdm[] {
    return this.clientes.filter(cliente => {
      const termo = this.busca.trim().toLowerCase();
      const texto = `
        ${cliente.nome}
        ${cliente.pet}
        ${cliente.tutor}
        ${cliente.telefone}
      `.toLowerCase();

      const passaBusca = texto.includes(termo);
      const passaEspecie = this.especie === 'Todas' || this.especieDoPet(cliente) === this.especie;
      const passaStatus = this.status === 'Todos' || cliente.status === this.status;

      return passaBusca && passaEspecie && passaStatus;
    });
  }

  get totalPaginas(): number {
    return Math.max(Math.ceil(this.clientesFiltrados.length / this.itensPorPagina), 1);
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  get clientesPaginados(): ClienteAdm[] {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    return this.clientesFiltrados.slice(inicio, inicio + this.itensPorPagina);
  }

  aplicarFiltros(): void {
    this.paginaAtual = 1;
  }

  limparFiltros(): void {
    this.busca = '';
    this.especie = 'Todas';
    this.status = 'Todos';
    this.paginaAtual = 1;
  }

  mudarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaAtual = pagina;
    }
  }

  editarCliente(cliente: ClienteAdm): void {
    this.modoEdicao = true;
    this.clienteSelecionado = cliente;
    this.novoCliente = { ...cliente };
    this.modalClienteAberto = true;
  }

  salvarCliente(): void {
    if (!this.novoCliente.nome.trim() || !this.novoCliente.pet.trim()) {
      this.mostrarToast('Preencha os campos obrigatórios identificadores do Pet.', 'erro');
      return;
    }

    if (this.modoEdicao && this.clienteSelecionado) {
      Object.assign(this.clienteSelecionado, this.novoCliente);
    }

    this.fecharModais();
    this.paginaAtual = 1;
  }

  abrirProntuario(cliente: ClienteAdm): void {
    this.clienteSelecionado = cliente;
    this.modalProntuarioAberto = true;
  }

  abrirAgendamento(cliente: ClienteAdm): void {
    this.clienteSelecionado = cliente;
    this.novaConsulta = this.criarConsultaVazia();
    this.modalAgendarAberto = true;
  }

  salvarAgendamento(): void {
    if (!this.novaConsulta.data || !this.novaConsulta.horario) {
      this.mostrarToast('Informe a data e o horário da consulta.', 'erro');
      return;
    }

    const payload = {
      servico: this.novaConsulta.procedimento.toLowerCase().includes('tosa') ? 'tosador' : 'veterinario',
      id_pet: this.clienteSelecionado?.id_pet,
      data_consulta: this.novaConsulta.data,
      hora_inicio: this.novaConsulta.horario,
      observacoes: this.novaConsulta.observacao
    };

    this.http.post(`${environment.apiUrl}/agendamento`, payload, { withCredentials: true }).subscribe({
      next: () => {
        this.mostrarToast(`Consulta para ${this.clienteSelecionado?.nome} agendada com sucesso!`, 'ok');
        this.fecharModais();
      },
      error: (err) => {
        this.mostrarToast(err.error?.mensagem || 'Erro ao processar agendamento.', 'erro');
      }
    });
  }

  alternarStatus(cliente: ClienteAdm): void {
    cliente.status = cliente.status === 'Inativo' ? 'Ativo' : 'Inativo';
  }

  excluirCliente(cliente: ClienteAdm): void {
    this.clienteParaExcluir = cliente;
  }

  cancelarExclusao(): void {
    this.clienteParaExcluir = null;
  }

  confirmarExclusao(): void {
    const cliente = this.clienteParaExcluir;
    this.clienteParaExcluir = null;
    if (!cliente) return;

    if (cliente.id_pet) {
      this.http.delete(`${environment.apiUrl}/user/listar/pet/delete/${cliente.id_pet}`, { withCredentials: true }).subscribe({
        next: () => {
          this.carregarClientesDoBanco();
          this.paginaAtual = 1;
        },
        error: (err) => console.error('Erro ao excluir pet:', err)
      });
    } else {
      this.clientes = this.clientes.filter(c => c !== cliente);
    }
  }

  get totalCaes(): number {
    return this.clientes.filter(c => this.especieDoPet(c) === 'Cão').length;
  }

  get totalGatos(): number {
    return this.clientes.filter(c => this.especieDoPet(c) === 'Gato').length;
  }

  /**
   * Descobre a espécie do pet olhando o campo "especie" e, se não bater,
   * o campo "pet" (a API às vezes manda a espécie ali: "cachorro", "gato"...).
   */
  especieDoPet(cliente: ClienteAdm): string {
    const texto = `${cliente.especie || ''} ${cliente.pet || ''}`
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

  get totalTratamento(): number {
    return this.clientes.filter(c => c.status === 'Em tratamento').length;
  }

  contagemStatus(status: string): number {
    if (status === 'Todos') return this.clientes.length;
    return this.clientes.filter(c => c.status === status).length;
  }

  definirStatus(status: string): void {
    this.status = status;
    this.aplicarFiltros();
  }

  definirEspecie(especie: string): void {
    this.especie = this.especie === especie ? 'Todas' : especie;
    this.aplicarFiltros();
  }

  mostrarToast(texto: string, tipo: 'ok' | 'erro'): void {
    this.toast = { texto, tipo };
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toast = null, 3500);
  }

  fecharModais(): void {
    this.modalClienteAberto = false;
    this.modalProntuarioAberto = false;
    this.modalAgendarAberto = false;
    this.clienteSelecionado = null;
  }
}