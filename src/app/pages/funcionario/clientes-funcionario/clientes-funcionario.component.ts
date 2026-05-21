import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConsultasService, ConsultaFuncionario } from '../../../core/services/consultas.service';

@Component({
  selector: 'app-clientes-funcionario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clientes-funcionario.component.html',
  styleUrl: './clientes-funcionario.component.css'
})
export class ClientesFuncionarioComponent {

  clienteEditando: any = null;
  clienteSelecionado: any = null;

  modoNovo = false;
  searchTerm = '';
  statusFiltro = 'Todos';

  modalDetalhesAberto = false;
  modalPetsAberto = false;
  modalAgendarAberto = false;

  novaConsulta = {
    horario: '',
    data: '',
    pet: '',
    idade: '',
    motivo: ''
  };

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
      petsLista: ['Thor', 'Luna', 'Mel']
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
      petsLista: ['Bob']
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
      petsLista: ['Max', 'Nina']
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
      petsLista: ['Cookie']
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
      petsLista: ['Lua']
    }
  ];

  constructor(private consultasService: ConsultasService) {}

  get clientesFiltrados() {
    const termo = this.searchTerm?.toLowerCase().trim() || '';

    return this.clientes.filter(cliente => {
      const matchTexto =
        !termo ||
        cliente.nome.toLowerCase().includes(termo) ||
        cliente.cpf.toLowerCase().includes(termo) ||
        cliente.telefone.toLowerCase().includes(termo) ||
        cliente.email.toLowerCase().includes(termo);

      const matchStatus =
        this.statusFiltro === 'Todos' ||
        cliente.status === this.statusFiltro;

      return matchTexto && matchStatus;
    });
  }

  get totalAtivos() {
    return this.clientes.filter(c => c.status === 'ATIVO').length;
  }

  get totalInativos() {
    return this.clientes.filter(c => c.status === 'INATIVO').length;
  }

  get totalPets() {
    return this.clientes.reduce((total, cliente) => total + Number(cliente.pets), 0);
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
      petsLista: []
    };
  }

  editar(cliente: any) {
    this.modoNovo = false;
    this.clienteEditando = { ...cliente, original: cliente };
  }

  abrirDetalhes(cliente: any) {
    this.clienteSelecionado = cliente;
    this.modalDetalhesAberto = true;
  }

  fecharDetalhes() {
    this.modalDetalhesAberto = false;
    this.clienteSelecionado = null;
  }

  verPets(cliente: any) {
    this.clienteSelecionado = cliente;
    this.modalPetsAberto = true;
  }

  fecharPets() {
    this.modalPetsAberto = false;
    this.clienteSelecionado = null;
  }

  agendarConsulta(cliente: any) {
    this.clienteSelecionado = cliente;
    this.modalAgendarAberto = true;

    this.novaConsulta = {
      horario: '',
      data: this.pegarDataHoje(),
      pet: '',
      idade: '',
      motivo: ''
    };
  }

  fecharAgendar() {
    this.modalAgendarAberto = false;
    this.clienteSelecionado = null;
  }

  salvarAgendamento() {
    if (
      !this.clienteSelecionado ||
      !this.novaConsulta.horario ||
      !this.novaConsulta.data ||
      !this.novaConsulta.pet ||
      !this.novaConsulta.idade ||
      !this.novaConsulta.motivo
    ) {
      alert('Preencha todos os campos do agendamento.');
      return;
    }

    const consulta: ConsultaFuncionario = {
      hora: this.novaConsulta.horario,
      horario: this.novaConsulta.horario,
      periodo: this.definirPeriodo(this.novaConsulta.horario),
      pet: this.novaConsulta.pet,
      idade: this.novaConsulta.idade,
      tutor: this.clienteSelecionado.nome,
      motivo: this.novaConsulta.motivo,
      status: 'AGENDADO',
      data: this.novaConsulta.data,
      imagem: 'assets/pets/pet-default.jpg',
      tipo: 'gray'
    };

    this.consultasService.adicionarConsulta(consulta);

    this.fecharAgendar();
    alert('Consulta agendada com sucesso!');
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

    if (!this.clienteEditando.petsLista) {
      this.clienteEditando.petsLista = [];
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

  private definirPeriodo(horario: string): string {
    const hora = Number(horario.split(':')[0]);
    return hora >= 12 ? 'PM' : 'AM';
  }

  private pegarDataHoje(): string {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');

    return `${ano}-${mes}-${dia}`;
  }
}