import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  clienteSelecionado: any = null;

  novoCliente: any = {
    nome: '',
    pet: '',
    idade: '',
    tutor: '',
    telefone: '',
    status: 'Ativo',
    especie: 'Cão',
    imagem: 'assets/img/pet1.png'
  };

  novaConsulta: any = {
    data: '',
    horario: '',
    veterinario: 'Dr. Ricardo Silva',
    procedimento: 'Consulta de Rotina',
    observacao: ''
  };

  clientes = [
    {
      nome: 'Bento',
      pet: 'Beagle',
      idade: '2 anos',
      tutor: 'Ricardo Oliveira',
      telefone: '(11) 98871-8855',
      status: 'Ativo',
      especie: 'Cão',
      imagem: 'assets/img/pet1.png'
    },
    {
      nome: 'Thor',
      pet: 'Golden',
      idade: '3 anos',
      tutor: 'André Santos',
      telefone: '(11) 91221-3334',
      status: 'Ativo',
      especie: 'Cão',
      imagem: 'assets/img/pet2.png'
    },
    {
      nome: 'Mel',
      pet: 'SRD',
      idade: '5 anos',
      tutor: 'Mariane Costa',
      telefone: '(11) 98453-2281',
      status: 'Em tratamento',
      especie: 'Cão',
      imagem: 'assets/img/pet3.png'
    },
    {
      nome: 'Luna',
      pet: 'Maine Coon',
      idade: '1 ano',
      tutor: 'Beatriz Lima',
      telefone: '(11) 97786-5544',
      status: 'Ativo',
      especie: 'Gato',
      imagem: 'assets/img/pet4.png'
    },
    {
      nome: 'Cookie',
      pet: 'Bulldog',
      idade: '4 anos',
      tutor: 'Gustavo Meireles',
      telefone: '(11) 93252-1100',
      status: 'Ativo',
      especie: 'Cão',
      imagem: 'assets/img/pet5.png'
    }
  ];

  get clientesFiltrados() {
    return this.clientes.filter(cliente => {
      const texto = `${cliente.nome} ${cliente.pet} ${cliente.tutor} ${cliente.telefone}`.toLowerCase();

      const passaBusca = texto.includes(this.busca.toLowerCase());
      const passaEspecie = this.especie === 'Todas' || cliente.especie === this.especie;
      const passaStatus = this.status === 'Todos' || cliente.status === this.status;

      return passaBusca && passaEspecie && passaStatus;
    });
  }

  get totalPaginas() {
    return Math.ceil(this.clientesFiltrados.length / this.itensPorPagina);
  }

  get paginas() {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  get clientesPaginados() {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    return this.clientesFiltrados.slice(inicio, inicio + this.itensPorPagina);
  }

  aplicarFiltros() {
    this.paginaAtual = 1;
  }

  limparFiltros() {
    this.busca = '';
    this.especie = 'Todas';
    this.status = 'Todos';
    this.paginaAtual = 1;
  }

  mudarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaAtual = pagina;
    }
  }

  abrirNovoCliente() {
    this.modoEdicao = false;
    this.clienteSelecionado = null;

    this.novoCliente = {
      nome: '',
      pet: '',
      idade: '',
      tutor: '',
      telefone: '',
      status: 'Ativo',
      especie: 'Cão',
      imagem: 'assets/img/pet1.png'
    };

    this.modalClienteAberto = true;
  }

  editarCliente(cliente: any) {
    this.modoEdicao = true;
    this.clienteSelecionado = cliente;
    this.novoCliente = { ...cliente };
    this.modalClienteAberto = true;
  }

  salvarCliente() {
    if (!this.novoCliente.nome || !this.novoCliente.pet || !this.novoCliente.tutor || !this.novoCliente.telefone) {
      alert('Preencha os campos obrigatórios.');
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

  abrirProntuario(cliente: any) {
    this.clienteSelecionado = cliente;
    this.modalProntuarioAberto = true;
  }

  abrirAgendamento(cliente: any) {
    this.clienteSelecionado = cliente;

    this.novaConsulta = {
      data: '',
      horario: '',
      veterinario: 'Dr. Ricardo Silva',
      procedimento: 'Consulta de Rotina',
      observacao: ''
    };

    this.modalAgendarAberto = true;
  }

  salvarAgendamento() {
    if (!this.novaConsulta.data || !this.novaConsulta.horario) {
      alert('Informe a data e o horário da consulta.');
      return;
    }

    alert(`Consulta agendada para ${this.clienteSelecionado.nome}.`);
    this.fecharModais();
  }

  alternarStatus(cliente: any) {
    cliente.status = cliente.status === 'Inativo' ? 'Ativo' : 'Inativo';
  }

  excluirCliente(cliente: any) {
    const confirmar = confirm(`Deseja excluir ${cliente.nome}?`);

    if (confirmar) {
      this.clientes = this.clientes.filter(c => c !== cliente);
      this.paginaAtual = 1;
    }
  }

  exportarLista() {
    const cabecalho = 'Pet;Raça;Idade;Tutor;Telefone;Status;Espécie\n';

    const conteudo = this.clientesFiltrados
      .map(c => `${c.nome};${c.pet};${c.idade};${c.tutor};${c.telefone};${c.status};${c.especie}`)
      .join('\n');

    const arquivo = new Blob([cabecalho + conteudo], { type: 'text/csv;charset=utf-8;' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(arquivo);
    link.download = 'clientes-petvitaliz.csv';
    link.click();
  }

  fecharModais() {
    this.modalClienteAberto = false;
    this.modalProntuarioAberto = false;
    this.modalAgendarAberto = false;
    this.clienteSelecionado = null;
  }
}