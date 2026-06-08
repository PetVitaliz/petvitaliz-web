import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

type StatusAgendamento = 'Confirmado' | 'Cancelado';

interface Pet {
  nome: string;
  tipo: string;
  idade: string;
  foto: string;
}

interface Agendamento {
  id: number;
  pet: string;
  servico: string;
  data: string;
  horario: string;
  status: StatusAgendamento;
  criadoEm: string;
}

@Component({
  selector: 'app-agendamento',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agendamento.component.html',
  styleUrl: './agendamento.component.css'
})
export class AgendamentoComponent implements OnInit {
  constructor(private router: Router) { }

  etapaAtual = 1;

  pets: Pet[] = [];

  servicos = [
    'Consulta Geral',
    'Vacinação',
    'Exames',
    'Banho e Tosa'
  ];

  horarios = [
    '09:00',
    '10:30',
    '13:00',
    '14:30',
    '16:00'
  ];

  agendamentos: Agendamento[] = [];

  petSelecionado = '';
  servicoSelecionado = '';
  dataSelecionada = '';
  horarioSelecionado = '';

  mensagemErro = '';
  mensagemSucesso = '';

  ngOnInit(): void {
    this.carregarPets();
    this.carregarAgendamentos();
  }

  get agendamentosAtivos(): Agendamento[] {
    return this.agendamentos.filter(agendamento => agendamento.status === 'Confirmado');
  }

  get historicoAgendamentos(): Agendamento[] {
    return this.agendamentos.filter(agendamento => agendamento.status === 'Cancelado');
  }

  carregarPets(): void {
    const petsSalvos = JSON.parse(localStorage.getItem('petsUsuario') || '[]');

    if (petsSalvos.length > 0) {
      this.pets = petsSalvos;
      return;
    }

    this.pets = [
      {
        nome: 'Max',
        tipo: 'Beagle',
        idade: '3 anos',
        foto: 'assets/img/pet-dog.jpg'
      },
      {
        nome: 'Luna',
        tipo: 'Siamês',
        idade: '1 ano',
        foto: 'assets/img/pet-cat.jpg'
      }
    ];

    localStorage.setItem('petsUsuario', JSON.stringify(this.pets));
  }

  salvarPets(): void {
    localStorage.setItem('petsUsuario', JSON.stringify(this.pets));
  }

  carregarAgendamentos(): void {
    this.agendamentos = JSON.parse(localStorage.getItem('agendamentosUsuario') || '[]');
  }

  salvarAgendamentos(): void {
    localStorage.setItem('agendamentosUsuario', JSON.stringify(this.agendamentos));
  }

  irParaCadastroPet(): void {
    this.router.navigate(['/user/listar/pet']);
  }

  selecionarPet(nome: string): void {
    this.petSelecionado = nome;
    this.mensagemErro = '';
    this.mensagemSucesso = '';
  }

  selecionarServico(servico: string): void {
    this.servicoSelecionado = servico;
    this.mensagemErro = '';
    this.mensagemSucesso = '';
  }

  selecionarHorario(horario: string): void {
    this.mensagemSucesso = '';

    if (this.horarioIndisponivel(horario)) {
      this.horarioSelecionado = '';
      this.mensagemErro = 'Esse horário já passou. Escolha outro horário.';
      return;
    }

    this.horarioSelecionado = horario;
    this.mensagemErro = '';
  }

  aoAlterarData(): void {
    this.mensagemErro = '';
    this.mensagemSucesso = '';
    this.horarioSelecionado = '';

    if (this.dataSelecionada && this.dataPassada()) {
      this.mensagemErro = 'Não é possível agendar consulta em uma data que já passou.';
    }
  }

  continuar(): void {
    this.mensagemErro = '';
    this.mensagemSucesso = '';

    if (!this.podeContinuar()) {
      this.mensagemErro = this.obterMensagemErro();
      return;
    }

    if (this.etapaAtual < 3) {
      this.etapaAtual++;
      return;
    }

    if (this.etapaAtual === 3) {
      this.finalizarAgendamento();
    }
  }

  voltar(): void {
    this.mensagemErro = '';
    this.mensagemSucesso = '';

    if (this.etapaAtual > 1) {
      this.etapaAtual--;
    }
  }

  voltarParaInicio(): void {
    this.limparFormulario();
  }

  podeContinuar(): boolean {
    if (this.etapaAtual === 1) {
      return !!this.petSelecionado;
    }

    if (this.etapaAtual === 2) {
      return !!this.servicoSelecionado;
    }

    if (this.etapaAtual === 3) {
      return (
        !!this.dataSelecionada &&
        !!this.horarioSelecionado &&
        !this.dataPassada() &&
        !this.horarioIndisponivel(this.horarioSelecionado)
      );
    }

    return true;
  }

  finalizarAgendamento(): void {
    this.mensagemErro = '';
    this.mensagemSucesso = '';

    if (
      !this.petSelecionado ||
      !this.servicoSelecionado ||
      !this.dataSelecionada ||
      !this.horarioSelecionado
    ) {
      this.mensagemErro = 'Preencha todos os dados antes de finalizar o agendamento.';
      return;
    }

    if (this.dataPassada()) {
      this.mensagemErro = 'Não é possível finalizar um agendamento em uma data que já passou.';
      return;
    }

    if (this.horarioIndisponivel(this.horarioSelecionado)) {
      this.mensagemErro = 'Esse horário já passou. Escolha outro horário.';
      return;
    }

    if (this.agendamentoJaExiste()) {
      this.mensagemErro = 'Já existe um agendamento ativo para esse pet nesse dia e horário.';
      return;
    }

    const novoAgendamento: Agendamento = {
      id: Date.now(),
      pet: this.petSelecionado,
      servico: this.servicoSelecionado,
      data: this.dataSelecionada,
      horario: this.horarioSelecionado,
      status: 'Confirmado',
      criadoEm: new Date().toISOString()
    };

    this.agendamentos.push(novoAgendamento);
    this.salvarAgendamentos();

    this.mensagemSucesso = 'Consulta agendada com sucesso!';
    this.etapaAtual = 4;
  }

  agendamentoJaExiste(): boolean {
    return this.agendamentos.some(agendamento =>
      agendamento.status === 'Confirmado' &&
      agendamento.pet === this.petSelecionado &&
      agendamento.data === this.dataSelecionada &&
      agendamento.horario === this.horarioSelecionado
    );
  }

  cancelarAgendamento(id: number): void {
    const confirmar = confirm('Tem certeza que deseja cancelar este agendamento?');

    if (!confirmar) {
      return;
    }

    this.agendamentos = this.agendamentos.map(agendamento => {
      if (agendamento.id === id) {
        return {
          ...agendamento,
          status: 'Cancelado'
        };
      }

      return agendamento;
    });

    this.salvarAgendamentos();
    this.mensagemSucesso = 'Agendamento cancelado com sucesso.';
    this.mensagemErro = '';
  }

  excluirPet(nome: string): void {
    const temAgendamentoAtivo = this.agendamentosAtivos.some(
      agendamento => agendamento.pet === nome
    );

    if (temAgendamentoAtivo) {
      this.mensagemErro = 'Não é possível excluir um pet com agendamento ativo.';
      this.mensagemSucesso = '';
      return;
    }

    const confirmar = confirm(`Tem certeza que deseja excluir ${nome}?`);

    if (!confirmar) {
      return;
    }

    this.pets = this.pets.filter(pet => pet.nome !== nome);
    this.salvarPets();

    if (this.petSelecionado === nome) {
      this.petSelecionado = '';
    }

    this.mensagemSucesso = 'Pet excluído com sucesso.';
    this.mensagemErro = '';
  }

  dataPassada(): boolean {
    if (!this.dataSelecionada) {
      return false;
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const dataSelecionada = new Date(this.dataSelecionada + 'T00:00:00');
    dataSelecionada.setHours(0, 0, 0, 0);

    return dataSelecionada < hoje;
  }

  dataEhHoje(): boolean {
    if (!this.dataSelecionada) {
      return false;
    }

    const hoje = new Date();
    const dataSelecionada = new Date(this.dataSelecionada + 'T00:00:00');

    return (
      dataSelecionada.getFullYear() === hoje.getFullYear() &&
      dataSelecionada.getMonth() === hoje.getMonth() &&
      dataSelecionada.getDate() === hoje.getDate()
    );
  }

  horarioIndisponivel(horario: string): boolean {
    if (!this.dataSelecionada || !this.dataEhHoje()) {
      return false;
    }

    const agora = new Date();
    const [hora, minuto] = horario.split(':').map(Number);

    const horarioConsulta = new Date();
    horarioConsulta.setHours(hora, minuto, 0, 0);

    return horarioConsulta <= agora;
  }

  obterDataMinima(): string {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');

    return `${ano}-${mes}-${dia}`;
  }

  formatarData(data: string): string {
    if (!data) {
      return '';
    }

    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  }

  obterMensagemErro(): string {
    if (this.etapaAtual === 1) {
      return 'Selecione um pet para continuar.';
    }

    if (this.etapaAtual === 2) {
      return 'Selecione um serviço para continuar.';
    }

    if (this.etapaAtual === 3) {
      if (!this.dataSelecionada) {
        return 'Selecione uma data para continuar.';
      }

      if (this.dataPassada()) {
        return 'Não é possível agendar consulta em uma data que já passou.';
      }

      if (!this.horarioSelecionado) {
        return 'Selecione um horário para continuar.';
      }

      if (this.horarioIndisponivel(this.horarioSelecionado)) {
        return 'Esse horário já passou. Escolha outro horário.';
      }
    }

    return 'Preencha os dados corretamente.';
  }

  limparFormulario(): void {
    this.etapaAtual = 1;
    this.petSelecionado = '';
    this.servicoSelecionado = '';
    this.dataSelecionada = '';
    this.horarioSelecionado = '';
    this.mensagemErro = '';
    this.mensagemSucesso = '';
  }
}