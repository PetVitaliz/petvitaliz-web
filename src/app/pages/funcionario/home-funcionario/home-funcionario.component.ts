import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConsultasService, ConsultaFuncionario } from '../../../core/services/consultas.service';

@Component({
  selector: 'app-home-funcionario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home-funcionario.component.html',
  styleUrl: './home-funcionario.component.css'
})
export class HomeFuncionarioComponent implements OnInit {

  filtroAberto = false;
  modalConsultaAberto = false;
  prontuarioAberto = false;
  dialogoAberto = false;

  dialogoTitulo = '';
  dialogoMensagem = '';

  filtroSelecionado = 'Todos';
  consultaSelecionada: ConsultaFuncionario | null = null;

  novaConsulta = {
    horario: '',
    pet: '',
    tutor: '',
    idade: '',
    motivo: ''
  };

  consultas: ConsultaFuncionario[] = [];

  constructor(private consultasService: ConsultasService) {}

  ngOnInit(): void {
    this.carregarConsultas();
  }

  carregarConsultas(): void {
    this.consultas = this.consultasService.listarConsultas();
    this.consultaSelecionada = null;
  }

  get consultasFiltradas(): ConsultaFuncionario[] {
    if (this.filtroSelecionado === 'Todos') {
      return this.consultas;
    }

    return this.consultas.filter(consulta => consulta.status === this.filtroSelecionado);
  }

  abrirDialogo(titulo: string, mensagem: string): void {
    this.dialogoTitulo = titulo;
    this.dialogoMensagem = mensagem;
    this.dialogoAberto = true;
  }

  fecharDialogo(): void {
    this.dialogoAberto = false;
  }

  selecionarConsulta(consulta: ConsultaFuncionario): void {
    this.consultaSelecionada = consulta;
  }

  abrirFiltros(): void {
    this.carregarConsultas();
    this.filtroAberto = true;
  }

  fecharFiltros(): void {
    this.filtroAberto = false;
  }

  aplicarFiltro(filtro: string): void {
    this.filtroSelecionado = filtro;
    this.consultaSelecionada = null;
    this.filtroAberto = false;
  }

  abrirNovaConsulta(): void {
    this.modalConsultaAberto = true;
    this.novaConsulta = {
      horario: '',
      pet: '',
      tutor: '',
      idade: '',
      motivo: ''
    };
  }

  fecharNovaConsulta(): void {
    this.modalConsultaAberto = false;
  }

  salvarNovaConsulta(): void {
    if (
      !this.novaConsulta.horario ||
      !this.novaConsulta.pet ||
      !this.novaConsulta.tutor ||
      !this.novaConsulta.idade ||
      !this.novaConsulta.motivo
    ) {
      this.abrirDialogo('Campos obrigatórios', 'Preencha horário, pet, tutor, idade e motivo antes de salvar a consulta.');
      return;
    }

    const novaConsulta: ConsultaFuncionario = {
      hora: this.novaConsulta.horario,
      horario: this.novaConsulta.horario,
      periodo: this.definirPeriodo(this.novaConsulta.horario),
      pet: this.novaConsulta.pet,
      tutor: this.novaConsulta.tutor,
      idade: this.novaConsulta.idade,
      motivo: this.novaConsulta.motivo,
      imagem: 'assets/pets/pet-default.jpg',
      status: 'AGENDADO',
      data: this.pegarDataHoje(),
      tipo: 'gray'
    };

    this.consultasService.adicionarConsulta(novaConsulta);
    this.carregarConsultas();

    this.fecharNovaConsulta();
    this.abrirDialogo('Consulta cadastrada', 'A nova consulta foi adicionada à agenda com sucesso.');
  }

  iniciarConsulta(): void {
    if (!this.consultaSelecionada) {
      this.abrirDialogo('Consulta não selecionada', 'Selecione uma consulta da agenda primeiro.');
      return;
    }

    this.prontuarioAberto = false;
    this.abrirDialogo('Consulta iniciada', `Consulta iniciada: ${this.consultaSelecionada.pet}`);
  }

  abrirProntuario(): void {
    if (!this.consultaSelecionada) {
      this.abrirDialogo('Prontuário indisponível', 'Selecione uma consulta para ver o prontuário.');
      return;
    }

    this.prontuarioAberto = true;
  }

  fecharProntuario(): void {
    this.prontuarioAberto = false;
  }

  private definirPeriodo(horario: string): string {
    const hora = Number(horario.split(':')[0]);

    if (hora >= 12) {
      return 'PM';
    }

    return 'AM';
  }

  private pegarDataHoje(): string {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');

    return `${ano}-${mes}-${dia}`;
  }
}