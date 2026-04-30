import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-consultas-funcionario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './consultas-funcionario.component.html',
  styleUrl: './consultas-funcionario.component.css'
})
export class ConsultasFuncionarioComponent {

  filtros = {
    pet: '',
    data: '',
    status: 'Todos os Status'
  };

  filtrosAplicados = {
    pet: '',
    data: '',
    status: 'Todos os Status'
  };

  paginaAtual = 1;
  itensPorPagina = 4;

  consultas = [
    {
      hora: '09:00',
      periodo: 'AM',
      pet: 'Thor',
      idade: '3 anos',
      tutor: 'Ricardo Alencar',
      motivo: 'Vacinação Anual',
      status: 'CONFIRMADO',
      data: '2026-10-23'
    },
    {
      hora: '10:00',
      periodo: 'AM',
      pet: 'Luna',
      idade: '2 anos',
      tutor: 'Maria Silva',
      motivo: 'Consulta de rotina',
      status: 'CONFIRMADO',
      data: '2026-10-23'
    },
    {
      hora: '11:00',
      periodo: 'AM',
      pet: 'Max',
      idade: '4 anos',
      tutor: 'João Souza',
      motivo: 'Retorno',
      status: 'CONFIRMADO',
      data: '2026-10-23'
    },
    {
      hora: '14:00',
      periodo: 'PM',
      pet: 'Mel',
      idade: '1 ano',
      tutor: 'Ana Paula',
      motivo: 'Vacinação',
      status: 'CONFIRMADO',
      data: '2026-10-23'
    }
  ];

  get consultasFiltradas() {
    return this.consultas.filter(c => {
      const pet = this.filtrosAplicados.pet.toLowerCase();
      const matchPet = !pet || c.pet.toLowerCase().includes(pet);

      const matchData = !this.filtrosAplicados.data || c.data === this.filtrosAplicados.data;

      const matchStatus =
        this.filtrosAplicados.status === 'Todos os Status' ||
        c.status === this.filtrosAplicados.status.toUpperCase();

      return matchPet && matchData && matchStatus;
    });
  }

  get totalPaginas() {
    return Math.ceil(this.consultasFiltradas.length / this.itensPorPagina);
  }

  get paginas() {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  get consultasPaginadas() {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    return this.consultasFiltradas.slice(inicio, inicio + this.itensPorPagina);
  }

  aplicarFiltros() {
    this.filtrosAplicados = { ...this.filtros };
    this.paginaAtual = 1;
  }

  limparFiltros() {
    this.filtros = {
      pet: '',
      data: '',
      status: 'Todos os Status'
    };

    this.filtrosAplicados = { ...this.filtros };
    this.paginaAtual = 1;
  }

  mudarPagina(p: number) {
    if (p < 1 || p > this.totalPaginas) return;
    this.paginaAtual = p;
  }
}