import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConsultasService, ConsultaFuncionario } from '../../../core/services/consultas.service';

@Component({
  selector: 'app-pets-funcionario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pets-funcionario.component.html',
  styleUrl: './pets-funcionario.component.css'
})
export class PetsFuncionarioComponent implements OnInit {

  filtroEspecie = 'Todos';
  filtroStatus = 'Ativo';

  visualizacao: 'grid' | 'lista' = 'grid';

  modalTipo = '';
  petSelecionado: any = null;
  petEditandoOriginal: any = null;

  paginaAtual = 1;
  itensPorPagina = 8;

  novoPet: any = this.criarPetVazio();

  agendamento = {
    data: '',
    horario: '',
    motivo: 'Consulta de rotina'
  };

  pets: any[] = [];

  petsPadrao = [
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

  constructor(private consultasService: ConsultasService) {}

  ngOnInit(): void {
    this.carregarPets();
  }

  carregarPets(): void {
    const petsSalvos = localStorage.getItem('pets');

    if (petsSalvos) {
      this.pets = JSON.parse(petsSalvos);
      return;
    }

    this.pets = [...this.petsPadrao];
    this.salvarPets();
  }

  salvarPets(): void {
    localStorage.setItem('pets', JSON.stringify(this.pets));
  }

  get petsFiltrados(): any[] {
    return this.pets.filter(pet => {
      const especieOk =
        this.filtroEspecie === 'Todos' ||
        pet.especie === this.filtroEspecie;

      const statusOk =
        this.filtroStatus === 'Todos' ||
        pet.status === this.filtroStatus;

      return especieOk && statusOk;
    });
  }

  get totalPaginas(): number {
    return Math.max(
      Math.ceil(this.petsFiltrados.length / this.itensPorPagina),
      1
    );
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  get petsPaginados(): any[] {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    return this.petsFiltrados.slice(inicio, inicio + this.itensPorPagina);
  }

  alterarEspecie(especie: string): void {
    this.filtroEspecie = especie;
    this.paginaAtual = 1;
  }

  alterarStatus(status: string): void {
    this.filtroStatus = status;
    this.paginaAtual = 1;
  }

  alternarVisualizacao(): void {
    this.visualizacao = this.visualizacao === 'grid' ? 'lista' : 'grid';
  }

  mudarPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.paginaAtual = pagina;
  }

  abrirNovoPaciente(): void {
    this.modalTipo = 'novo';
    this.petSelecionado = null;
    this.petEditandoOriginal = null;
    this.novoPet = this.criarPetVazio();
  }

  abrirEdicao(pet: any): void {
    this.modalTipo = 'editar';
    this.petSelecionado = pet;
    this.petEditandoOriginal = pet;
    this.novoPet = { ...pet };
  }

  salvarPet(): void {
    if (
      !this.novoPet.nome ||
      !this.novoPet.especie ||
      !this.novoPet.raca ||
      !this.novoPet.idade ||
      !this.novoPet.tutor
    ) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }

    if (this.modalTipo === 'editar' && this.petEditandoOriginal) {
      Object.assign(this.petEditandoOriginal, this.novoPet);
    } else {
      this.pets.unshift({ ...this.novoPet });
    }

    this.salvarPets();
    this.paginaAtual = 1;
    this.fecharModal();
  }

  excluirPet(pet: any): void {
    const confirmar = confirm(`Deseja excluir o paciente ${pet.nome}?`);

    if (!confirmar) return;

    this.pets = this.pets.filter(item => item !== pet);
    this.salvarPets();

    if (this.paginaAtual > this.totalPaginas) {
      this.paginaAtual = this.totalPaginas;
    }
  }

  abrirProntuario(pet: any): void {
    this.modalTipo = 'prontuario';
    this.petSelecionado = pet;
  }

  abrirAgendamento(pet: any): void {
    this.modalTipo = 'agendar';
    this.petSelecionado = pet;

    this.agendamento = {
      data: this.pegarDataHoje(),
      horario: '',
      motivo: 'Consulta de rotina'
    };
  }

  salvarAgendamento(): void {
    if (
      !this.petSelecionado ||
      !this.agendamento.data ||
      !this.agendamento.horario ||
      !this.agendamento.motivo
    ) {
      alert('Preencha todos os dados do agendamento.');
      return;
    }

    const consulta: ConsultaFuncionario = {
      hora: this.agendamento.horario,
      horario: this.agendamento.horario,
      periodo: this.definirPeriodo(this.agendamento.horario),
      pet: this.petSelecionado.nome,
      idade: this.petSelecionado.idade,
      tutor: this.petSelecionado.tutor,
      motivo: this.agendamento.motivo,
      status: 'AGENDADO',
      data: this.agendamento.data,
      imagem: '',
      tipo: 'gray'
    };

    this.consultasService.adicionarConsulta(consulta);

    alert(`Consulta agendada para ${this.petSelecionado.nome}.`);
    this.fecharModal();
  }

  inicialPet(pet: any): string {
    if (!pet || !pet.nome) return 'P';
    return pet.nome.charAt(0).toUpperCase();
  }

  fecharModal(): void {
    this.modalTipo = '';
    this.petSelecionado = null;
    this.petEditandoOriginal = null;
  }

  private criarPetVazio(): any {
    return {
      nome: '',
      especie: 'Cão',
      raca: '',
      idade: '',
      status: 'Ativo',
      tutor: '',
      prontuario: 'Novo paciente cadastrado.'
    };
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