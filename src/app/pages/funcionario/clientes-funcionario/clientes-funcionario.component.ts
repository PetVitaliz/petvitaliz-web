import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-clientes-funcionario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clientes-funcionario.component.html',
  styleUrl: './clientes-funcionario.component.css'
})
export class ClientesFuncionarioComponent {

  clienteEditando: any = null;
  modoNovo = false;
  searchTerm = '';

  clientes = [
    {
      nome: 'Ana Paula Oliveira',
      cpf: '123.456.789-00',
      telefone: '(11) 98765-4321',
      email: 'ana.oliveira@email.com',
      pets: '03',
      ultimaVisita: '12 Out 2023',
      ultimaVisitaData: '2023-10-12',
      status: 'ATIVO',
      foto: 'assets/img/cliente1.png'
    },
    {
      nome: 'Ricardo Santos',
      cpf: '987.654.321-11',
      telefone: '(11) 91234-5678',
      email: 'ricardo.s@email.com',
      pets: '01',
      ultimaVisita: '05 Nov 2023',
      ultimaVisitaData: '2023-11-05',
      status: 'ATIVO',
      foto: 'assets/img/cliente2.png'
    },
    {
      nome: 'Beatriz Mendes',
      cpf: '456.123.789-22',
      telefone: '(21) 99888-7766',
      email: 'beatriz.m@email.com',
      pets: '02',
      ultimaVisita: '15 Jan 2023',
      ultimaVisitaData: '2023-01-15',
      status: 'INATIVO',
      foto: 'assets/img/cliente3.png'
    },
    {
      nome: 'Carlos Eduardo',
      cpf: '321.654.987-33',
      telefone: '(11) 94444-3333',
      email: 'carlos.edu@email.com',
      pets: '01',
      ultimaVisita: '01 Dez 2023',
      ultimaVisitaData: '2023-12-01',
      status: 'ATIVO',
      foto: 'assets/img/cliente4.png'
    },
    {
      nome: 'Felipe',
      cpf: '321.654.987-33',
      telefone: '(11) 94444-3333',
      email: 'felipe@email.com',
      pets: '01',
      ultimaVisita: '01 Dez 2023',
      ultimaVisitaData: '2023-12-01',
      status: 'ATIVO',
      foto: 'assets/img/cliente5.png'
    }
  ];

  get clientesFiltrados() {
    const termo = this.searchTerm?.toLowerCase().trim() || '';

    if (!termo) return this.clientes;

    return this.clientes.filter(cliente =>
      cliente.nome.toLowerCase().includes(termo) ||
      cliente.cpf.toLowerCase().includes(termo) ||
      cliente.telefone.toLowerCase().includes(termo) ||
      cliente.email.toLowerCase().includes(termo)
    );
  }

  novoCliente() {
    this.modoNovo = true;

    this.clienteEditando = {
      nome: '',
      cpf: '',
      telefone: '',
      email: '',
      pets: '',
      ultimaVisita: '',
      ultimaVisitaData: '',
      status: 'ATIVO',
      foto: 'assets/img/cliente1.png'
    };
  }

  editar(cliente: any) {
    this.modoNovo = false;
    this.clienteEditando = { ...cliente, original: cliente };
  }

  formatarCPF() {
    let valor = this.clienteEditando.cpf.replace(/\D/g, '');

    valor = valor.slice(0, 11);

    valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
    valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
    valor = valor.replace(/(\d{3})(\d{1,2})$/, '$1-$2');

    this.clienteEditando.cpf = valor;
  }

  formatarTelefone() {
    let valor = this.clienteEditando.telefone.replace(/\D/g, '');

    valor = valor.slice(0, 11);

    if (valor.length <= 10) {
      valor = valor.replace(/(\d{2})(\d)/, '($1) $2');
      valor = valor.replace(/(\d{4})(\d)/, '$1-$2');
    } else {
      valor = valor.replace(/(\d{2})(\d)/, '($1) $2');
      valor = valor.replace(/(\d{5})(\d)/, '$1-$2');
    }

    this.clienteEditando.telefone = valor;
  }

  formatarDataParaExibicao(data: string) {
    if (!data) return '';

    const [ano, mes, dia] = data.split('-');

    const meses: any = {
      '01': 'Jan',
      '02': 'Fev',
      '03': 'Mar',
      '04': 'Abr',
      '05': 'Mai',
      '06': 'Jun',
      '07': 'Jul',
      '08': 'Ago',
      '09': 'Set',
      '10': 'Out',
      '11': 'Nov',
      '12': 'Dez'
    };

    return `${dia} ${meses[mes]} ${ano}`;
  }

  salvar() {
    if (this.clienteEditando.ultimaVisitaData) {
      this.clienteEditando.ultimaVisita = this.formatarDataParaExibicao(this.clienteEditando.ultimaVisitaData);
    }

    if (this.clienteEditando.pets !== '') {
      const quantidade = Number(this.clienteEditando.pets);
      this.clienteEditando.pets = quantidade < 10 ? `0${quantidade}` : `${quantidade}`;
    }

    if (this.modoNovo) {
      const novoCliente = { ...this.clienteEditando };
      delete novoCliente.original;
      this.clientes.unshift(novoCliente);
    } else {
      Object.assign(this.clienteEditando.original, this.clienteEditando);
      delete this.clienteEditando.original;
    }

    this.clienteEditando = null;
    this.modoNovo = false;
  }

  cancelar() {
    this.clienteEditando = null;
    this.modoNovo = false;
  }
}