import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ConsultasService, ConsultaFuncionario } from '../../../core/services/consultas.service';

@Component({
  selector: 'app-home-funcionario',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './home-funcionario.component.html',
  styleUrl: './home-funcionario.component.css'
})
export class HomeFuncionarioComponent implements OnInit {

  filtroAberto = false;
  prontuarioAberto = false;
  dialogoAberto = false;

  dialogoTitulo = '';
  dialogoMensagem = '';

  filtroSelecionado = 'Todos';
  consultaSelecionada: ConsultaFuncionario | null = null;

  dataAtual = '';
  consultas: ConsultaFuncionario[] = [];

  constructor(private consultasService: ConsultasService) { }

  ngOnInit(): void {
    this.carregarConsultas();
    this.definirDataAtual();
  }

  carregarConsultas(): void {
    this.consultas = this.consultasService.listarConsultas();
    this.consultaSelecionada = null;
  }

  get consultasFiltradas(): ConsultaFuncionario[] {
    if (this.filtroSelecionado === 'Todos') {
      return this.consultas;
    }

    return this.consultas.filter(
      consulta => consulta.status === this.filtroSelecionado
    );
  }

  get totalHoje(): number {
    return this.consultas.length;
  }

  get urgenciasHoje(): number {
    return this.consultas.filter(
      consulta => consulta.status === 'URGENTE'
    ).length;
  }

  get cirurgiasHoje(): number {
    return this.consultas.filter(
      consulta => consulta.motivo.toLowerCase().includes('cirurgia')
    ).length;
  }

  get laudosPendentes(): number {
    return this.consultas.filter(
      consulta => consulta.status === 'EM ESPERA'
    ).length;
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

  iniciarConsulta(): void {
    if (!this.consultaSelecionada) {
      this.abrirDialogo(
        'Consulta não selecionada',
        'Selecione uma consulta da agenda primeiro.'
      );

      return;
    }

    this.consultasService.atualizarStatus(
      this.consultaSelecionada,
      'EM ATENDIMENTO'
    );

    this.consultaSelecionada.status = 'EM ATENDIMENTO';
    this.consultaSelecionada.tipo = 'blue';

    this.prontuarioAberto = false;

    this.abrirDialogo(
      'Atendimento iniciado',
      `O atendimento de ${this.consultaSelecionada.pet} foi iniciado com sucesso.`
    );
  }

  abrirProntuario(): void {
    if (!this.consultaSelecionada) {
      this.abrirDialogo(
        'Prontuário indisponível',
        'Selecione uma consulta para ver o prontuário.'
      );

      return;
    }

    this.prontuarioAberto = true;
  }

  fecharProntuario(): void {
    this.prontuarioAberto = false;
  }

  inicialPet(consulta: ConsultaFuncionario | null): string {
    if (!consulta || !consulta.pet) {
      return 'P';
    }

    return consulta.pet.charAt(0).toUpperCase();
  }

  private definirDataAtual(): void {
    const hoje = new Date();

    this.dataAtual = hoje.toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long'
    });
  }
}