import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ClienteAdm {
  nome: string;
  pet: string;
  idade: string;
  tutor: string;
  telefone: string;
  status: 'Ativo' | 'Em tratamento' | 'Inativo';
  especie: 'Cão' | 'Gato';
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
export class ClientesAdmComponent {

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

  clientes: ClienteAdm[] = [
    {
      nome: 'Bento',
      pet: 'Beagle',
      idade: '2 anos',
      tutor: 'Ricardo Oliveira',
      telefone: '(11) 98871-8855',
      status: 'Ativo',
      especie: 'Cão'
    },
    {
      nome: 'Thor',
      pet: 'Golden',
      idade: '3 anos',
      tutor: 'André Santos',
      telefone: '(11) 91221-3334',
      status: 'Ativo',
      especie: 'Cão'
    },
    {
      nome: 'Mel',
      pet: 'SRD',
      idade: '5 anos',
      tutor: 'Mariane Costa',
      telefone: '(11) 98453-2281',
      status: 'Em tratamento',
      especie: 'Cão'
    },
    {
      nome: 'Luna',
      pet: 'Maine Coon',
      idade: '1 ano',
      tutor: 'Beatriz Lima',
      telefone: '(11) 97786-5544',
      status: 'Ativo',
      especie: 'Gato'
    },
    {
      nome: 'Cookie',
      pet: 'Bulldog',
      idade: '4 anos',
      tutor: 'Gustavo Meireles',
      telefone: '(11) 93252-1100',
      status: 'Ativo',
      especie: 'Cão'
    }
  ];

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
    if (!nome || !nome.trim()) {
      return '?';
    }

    return nome.trim().charAt(0).toUpperCase();
  }

  get clientesFiltrados(): ClienteAdm[] {
    return this.clientes.filter(cliente => {
      const texto = `
        ${cliente.nome}
        ${cliente.pet}
        ${cliente.tutor}
        ${cliente.telefone}
      `.toLowerCase();

      const passaBusca = texto.includes(this.busca.trim().toLowerCase());
      const passaEspecie = this.especie === 'Todas' || cliente.especie === this.especie;
      const passaStatus = this.status === 'Todos' || cliente.status === this.status;

      return passaBusca && passaEspecie && passaStatus;
    });
  }

  get totalPaginas(): number {
    return Math.ceil(this.clientesFiltrados.length / this.itensPorPagina);
  }

  get paginas(): number[] {
    return Array.from(
      { length: this.totalPaginas },
      (_, i) => i + 1
    );
  }

  get clientesPaginados(): ClienteAdm[] {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;

    return this.clientesFiltrados.slice(
      inicio,
      inicio + this.itensPorPagina
    );
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

  abrirNovoCliente(): void {
    this.modoEdicao = false;
    this.clienteSelecionado = null;
    this.novoCliente = this.criarClienteVazio();
    this.modalClienteAberto = true;
  }

  editarCliente(cliente: ClienteAdm): void {
    this.modoEdicao = true;
    this.clienteSelecionado = cliente;
    this.novoCliente = { ...cliente };
    this.modalClienteAberto = true;
  }

  salvarCliente(): void {
    if (
      !this.novoCliente.nome.trim() ||
      !this.novoCliente.pet.trim() ||
      !this.novoCliente.idade.trim() ||
      !this.novoCliente.tutor.trim() ||
      !this.novoCliente.telefone.trim()
    ) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }

    if (this.modoEdicao && this.clienteSelecionado) {
      Object.assign(this.clienteSelecionado, this.novoCliente);
    } else {
      this.clientes.unshift({ ...this.novoCliente });
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
      alert('Informe a data e o horário da consulta.');
      return;
    }

    if (!this.clienteSelecionado) {
      alert('Nenhum cliente selecionado.');
      return;
    }

    alert(`Consulta agendada para ${this.clienteSelecionado.nome}.`);
    this.fecharModais();
  }

  alternarStatus(cliente: ClienteAdm): void {
    cliente.status = cliente.status === 'Inativo' ? 'Ativo' : 'Inativo';
  }

  excluirCliente(cliente: ClienteAdm): void {
    const confirmar = confirm(`Deseja excluir ${cliente.nome}?`);

    if (confirmar) {
      this.clientes = this.clientes.filter(c => c !== cliente);
      this.paginaAtual = 1;
    }
  }

  exportarLista(): void {
    const cabecalho = 'Pet;Raça;Idade;Tutor;Telefone;Status;Espécie\n';

    const conteudo = this.clientesFiltrados
      .map(cliente => {
        return `${cliente.nome};${cliente.pet};${cliente.idade};${cliente.tutor};${cliente.telefone};${cliente.status};${cliente.especie}`;
      })
      .join('\n');

    const arquivo = new Blob(
      [cabecalho + conteudo],
      { type: 'text/csv;charset=utf-8;' }
    );

    const link = document.createElement('a');
    link.href = URL.createObjectURL(arquivo);
    link.download = 'clientes-petvitaliz.csv';
    link.click();

    URL.revokeObjectURL(link.href);
  }

  fecharModais(): void {
    this.modalClienteAberto = false;
    this.modalProntuarioAberto = false;
    this.modalAgendarAberto = false;
    this.clienteSelecionado = null;
  }
}