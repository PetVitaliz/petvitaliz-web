import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pets-funcionario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pets-funcionario.component.html',
  styleUrl: './pets-funcionario.component.css'
})
export class PetsFuncionarioComponent {
  filtroEspecie = 'Todos';
  filtroStatus = 'Ativo';

  visualizacao: 'grid' | 'lista' = 'grid';

  modalTipo = '';
  petSelecionado: any = null;

  paginaAtual = 1;
  itensPorPagina = 8;

  novoPet: any = {
    nome: '',
    especie: 'Cão',
    raca: '',
    idade: '',
    status: 'Ativo',
    tutor: '',
    prontuario: ''
  };

  agendamento: any = {
    data: '',
    horario: '',
    motivo: ''
  };

  pets = [
    {
      nome: 'Bento',
      especie: 'Cão',
      raca: 'Golden Retriever',
      idade: '2 anos',
      status: 'Ativo',
      tutor: 'Helena Silva',
      prontuario: 'Vacinas em dia. Última consulta sem alterações.'
    },
    {
      nome: 'Misty',
      especie: 'Gato',
      raca: 'Siamês',
      idade: '4 anos',
      status: 'Ativo',
      tutor: 'Ricardo Souza',
      prontuario: 'Histórico de alergia leve.'
    },
    {
      nome: 'Thor',
      especie: 'Cão',
      raca: 'Bulldog Inglês',
      idade: '6 anos',
      status: 'Ativo',
      tutor: 'Ana Beatriz',
      prontuario: 'Acompanhamento respiratório.'
    },
    {
      nome: 'Luna',
      especie: 'Gato',
      raca: 'Maine Coon',
      idade: '1 ano',
      status: 'Ativo',
      tutor: 'Marcos Oliveira',
      prontuario: 'Primeira consulta realizada.'
    },
    {
      nome: 'Pipoca',
      especie: 'Cão',
      raca: 'Beagle',
      idade: '3 anos',
      status: 'Ativo',
      tutor: 'Julia Mendes',
      prontuario: 'Controle de peso recomendado.'
    },
    {
      nome: 'Cookie',
      especie: 'Cão',
      raca: 'Poodle Toy',
      idade: '5 anos',
      status: 'Ativo',
      tutor: 'Fabio Costa',
      prontuario: 'Vacinação anual pendente.'
    },
    {
      nome: 'Max',
      especie: 'Cão',
      raca: 'Pastor Alemão',
      idade: '7 anos',
      status: 'Ativo',
      tutor: 'Camila Ferrag',
      prontuario: 'Exames recentes normais.'
    },
    {
      nome: 'Amora',
      especie: 'Cão',
      raca: 'Dachshund',
      idade: '9 meses',
      status: 'Em Tratamento',
      tutor: 'Gabriel Lima',
      prontuario: 'Tratamento dermatológico em andamento.'
    }
  ];

  get petsFiltrados() {
    return this.pets.filter(pet => {
      const especieOk = this.filtroEspecie === 'Todos' || pet.especie === this.filtroEspecie;
      const statusOk = this.filtroStatus === 'Todos' || pet.status === this.filtroStatus;
      return especieOk && statusOk;
    });
  }

  get totalPaginas() {
    return Math.ceil(this.petsFiltrados.length / this.itensPorPagina);
  }

  get paginas() {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  get petsPaginados() {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    return this.petsFiltrados.slice(inicio, inicio + this.itensPorPagina);
  }

  alterarEspecie(especie: string) {
    this.filtroEspecie = especie;
    this.paginaAtual = 1;
  }

  alterarStatus(status: string) {
    this.filtroStatus = status;
    this.paginaAtual = 1;
  }

  alternarVisualizacao() {
    this.visualizacao = this.visualizacao === 'grid' ? 'lista' : 'grid';
  }

  mudarPagina(pagina: number) {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.paginaAtual = pagina;
  }

  abrirNovoPaciente() {
    this.modalTipo = 'novo';
    this.petSelecionado = null;

    this.novoPet = {
      nome: '',
      especie: 'Cão',
      raca: '',
      idade: '',
      status: 'Ativo',
      tutor: '',
      prontuario: 'Novo paciente cadastrado.'
    };
  }

  abrirProntuario(pet: any) {
    this.modalTipo = 'prontuario';
    this.petSelecionado = pet;
  }

  abrirAgendamento(pet: any) {
    this.modalTipo = 'agendar';
    this.petSelecionado = pet;

    this.agendamento = {
      data: '',
      horario: '',
      motivo: ''
    };
  }

  salvarNovoPaciente() {
    if (!this.novoPet.nome || !this.novoPet.raca || !this.novoPet.idade || !this.novoPet.tutor) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }

    this.pets.unshift({ ...this.novoPet });
    this.paginaAtual = 1;
    this.fecharModal();
  }

  salvarAgendamento() {
    if (!this.agendamento.data || !this.agendamento.horario || !this.agendamento.motivo) {
      alert('Preencha todos os dados do agendamento.');
      return;
    }

    alert(`Consulta agendada para ${this.petSelecionado.nome}.`);
    this.fecharModal();
  }

  fecharModal() {
    this.modalTipo = '';
    this.petSelecionado = null;
  }

  exportarLista() {
    alert('Lista exportada com sucesso!');
  }

  imprimirRelatorio(pet: any) {
    this.petSelecionado = pet;
    this.modalTipo = 'imprimir';

    setTimeout(() => {
      window.print();
    }, 200);
  }
}