import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
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
  filtroStatus = 'Todos';
  visualizacao: 'grid' | 'lista' = 'grid';

  modalTipo = '';
  petSelecionado: any = null;

  paginaAtual = 1;
  itensPorPagina = 8;

  agendamento = {
    data: '',
    horario: '',
    motivo: 'Consulta de rotina'
  };

  pets: any[] = [];

  constructor(private http: HttpClient, private consultasService: ConsultasService) {}

  ngOnInit(): void {
    this.carregarPetsDaAPI();
  }

  carregarPetsDaAPI(): void {
    this.http.get<any>(`${environment.apiUrl}/funcionario/pets`, { withCredentials: true })
      .subscribe({
        next: (res) => {
          this.pets = res.pets || res || [];
        },
        error: (err) => {
          console.error('Erro ao buscar o diretório global de pacientes:', err);
        }
      });
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
    return Math.max(Math.ceil(this.petsFiltrados.length / this.itensPorPagina), 1);
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
    alert('O cadastro de novos pacientes é feito pelos tutores em suas respectivas contas para garantir o vínculo correto.');
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
      idade: this.petSelecionado.idadeTexto,
      tutor: this.petSelecionado.tutor,
      motivo: this.agendamento.motivo,
      status: 'AGENDADO',
      data: this.agendamento.data,
      imagem: '',
      tipo: 'gray'
    };

    this.consultasService.adicionarConsulta(consulta);
    alert(`Consulta agendada para o paciente ${this.petSelecionado.nome} com sucesso!`);
    this.fecharModal();
  }

  inicialPet(pet: any): string {
    if (!pet || !pet.nome) return 'P';
    return pet.nome.charAt(0).toUpperCase();
  }

  fecharModal(): void {
    this.modalTipo = '';
    this.petSelecionado = null;
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