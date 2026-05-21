import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-agendamento',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agendamento.component.html',
  styleUrl: './agendamento.component.css'
})
export class AgendamentoComponent {
  etapaAtual = 1;

  pets = [
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

  petSelecionado = '';
  servicoSelecionado = '';
  dataSelecionada = '';
  horarioSelecionado = '';

  selecionarPet(nome: string): void {
    this.petSelecionado = nome;
  }

  selecionarServico(servico: string): void {
    this.servicoSelecionado = servico;
  }

  selecionarHorario(horario: string): void {
    this.horarioSelecionado = horario;
  }

  continuar(): void {
    if (this.etapaAtual < 4) {
      this.etapaAtual++;
    }
  }

  voltar(): void {
    if (this.etapaAtual > 1) {
      this.etapaAtual--;
    }
  }

  podeContinuar(): boolean {
    if (this.etapaAtual === 1) return !!this.petSelecionado;
    if (this.etapaAtual === 2) return !!this.servicoSelecionado;
    if (this.etapaAtual === 3) return !!this.dataSelecionada && !!this.horarioSelecionado;
    return true;
  }
}