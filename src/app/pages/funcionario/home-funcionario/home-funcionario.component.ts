import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home-funcionario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home-funcionario.component.html',
  styleUrl: './home-funcionario.component.css'
})
export class HomeFuncionarioComponent {
  filtroAberto = false;
  modalConsultaAberto = false;
  prontuarioAberto = false;
  dialogoAberto = false;

  dialogoTitulo = '';
  dialogoMensagem = '';

  filtroSelecionado = 'Todos';
  consultaSelecionada: any = null;

  novaConsulta = {
    horario: '',
    pet: '',
    motivo: ''
  };

  consultas = [
    {
      horario: '09:00',
      periodo: 'AM',
      pet: 'Thor (Golden)',
      motivo: 'Retorno Pós-Operatório',
      imagem: 'assets/pets/thor.jpg',
      status: 'EM ESPERA',
      tipo: 'gray'
    },
    {
      horario: '10:30',
      periodo: 'AM',
      pet: 'Luna (Golden)',
      motivo: 'Vacinação Anual',
      imagem: 'assets/pets/luna.jpg',
      status: 'CONFIRMADO',
      tipo: 'green'
    },
    {
      horario: '11:15',
      periodo: 'AM',
      pet: 'Bento (Bulldog Francês)',
      motivo: 'Suspeita de Alergia Alimentar',
      imagem: 'assets/pets/bento.jpg',
      status: 'URGENTE',
      tipo: 'red'
    },
    {
      horario: '14:00',
      periodo: 'PM',
      pet: 'Cookie (SRD)',
      motivo: 'Consulta Geral',
      imagem: 'assets/pets/cookie.jpg',
      status: 'AGENDADO',
      tipo: 'gray'
    }
  ];

  get consultasFiltradas() {
    if (this.filtroSelecionado === 'Todos') {
      return this.consultas;
    }

    return this.consultas.filter(consulta => consulta.status === this.filtroSelecionado);
  }

  abrirDialogo(titulo: string, mensagem: string) {
    this.dialogoTitulo = titulo;
    this.dialogoMensagem = mensagem;
    this.dialogoAberto = true;
  }

  fecharDialogo() {
    this.dialogoAberto = false;
  }

  selecionarConsulta(consulta: any) {
    this.consultaSelecionada = consulta;
  }

  abrirFiltros() {
    this.filtroAberto = true;
  }

  fecharFiltros() {
    this.filtroAberto = false;
  }

  aplicarFiltro(filtro: string) {
    this.filtroSelecionado = filtro;
    this.consultaSelecionada = null;
    this.filtroAberto = false;
  }

  abrirNovaConsulta() {
    this.modalConsultaAberto = true;
    this.novaConsulta = {
      horario: '',
      pet: '',
      motivo: ''
    };
  }

  fecharNovaConsulta() {
    this.modalConsultaAberto = false;
  }

  salvarNovaConsulta() {
    if (!this.novaConsulta.horario || !this.novaConsulta.pet || !this.novaConsulta.motivo) {
      this.abrirDialogo('Campos obrigatórios', 'Preencha todos os campos antes de salvar a consulta.');
      return;
    }

    this.consultas.push({
      horario: this.novaConsulta.horario,
      periodo: 'AM',
      pet: this.novaConsulta.pet,
      motivo: this.novaConsulta.motivo,
      imagem: 'assets/pets/pet-default.jpg',
      status: 'AGENDADO',
      tipo: 'gray'
    });

    this.fecharNovaConsulta();
    this.abrirDialogo('Consulta cadastrada', 'A nova consulta foi adicionada à agenda com sucesso.');
  }

  iniciarConsulta() {
    if (!this.consultaSelecionada) {
      this.abrirDialogo('Consulta não selecionada', 'Selecione uma consulta da agenda primeiro.');
      return;
    }

    this.prontuarioAberto = false;
    this.abrirDialogo('Consulta iniciada', `Consulta iniciada: ${this.consultaSelecionada.pet}`);
  }

  abrirProntuario() {
    if (!this.consultaSelecionada) {
      this.abrirDialogo('Prontuário indisponível', 'Selecione uma consulta para ver o prontuário.');
      return;
    }

    this.prontuarioAberto = true;
  }

  fecharProntuario() {
    this.prontuarioAberto = false;
  }
}