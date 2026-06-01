import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Funcionario {
  id: string;
  nome: string;
  cargo: string;
  email: string;
  telefone: string;
  status: 'Ativo' | 'Inativo';
  avatar: string;
}

@Component({
  selector: 'app-equipe-funcionarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './equipe-funcionarios.component.html',
  styleUrl: './equipe-funcionarios.component.css'
})
export class EquipeFuncionariosComponent {
  busca = '';
  filtroCargo = 'Todos os Cargos';
  filtroStatus = 'Status: Todos';

  paginaAtual = 1;
  itensPorPagina = 4;

  modalAberto = false;
  modoEdicao = false;

  funcionarioForm: Funcionario = this.criarFuncionarioVazio();

  funcionarios: Funcionario[] = [
    {
      id: '#PV-4492',
      nome: 'Dr. Ricardo Silva',
      cargo: 'Veterinário Sênior',
      email: 'ricardo.silva@petvital.com',
      telefone: '(11) 98822-1234',
      status: 'Ativo',
      avatar: 'assets/img/func1.png'
    },
    {
      id: '#PV-4501',
      nome: 'Ana Payla Martins',
      cargo: 'Auxiliar Clínica',
      email: 'ana.martins@petvital.com',
      telefone: '(11) 97711-4321',
      status: 'Ativo',
      avatar: 'assets/img/func2.png'
    },
    {
      id: '#PV-4102',
      nome: 'Jyliana Costa',
      cargo: 'Recepcionista',
      email: 'juliana.c@petvital.com',
      telefone: '(11) 94455-9876',
      status: 'Inativo',
      avatar: 'assets/img/func3.png'
    },
    {
      id: '#PV-4388',
      nome: 'Dr. Marcos Oliveira',
      cargo: 'Cirurgião Vet',
      email: 'marcos.oliveira@petvital.com',
      telefone: '(11) 91122-3344',
      status: 'Ativo',
      avatar: 'assets/img/func4.png'
    },
    {
      id: '#PV-4510',
      nome: 'Camila Souza',
      cargo: 'Veterinário Sênior',
      email: 'camila.souza@petvital.com',
      telefone: '(11) 95544-2222',
      status: 'Ativo',
      avatar: 'assets/img/func2.png'
    },
    {
      id: '#PV-4511',
      nome: 'Roberto Lima',
      cargo: 'Auxiliar Clínica',
      email: 'roberto.lima@petvital.com',
      telefone: '(11) 93333-1212',
      status: 'Inativo',
      avatar: 'assets/img/func1.png'
    }
  ];

  get totalFuncionarios(): number {
    return this.funcionarios.length;
  }

  get veterinariosAtivos(): number {
    return this.funcionarios.filter(f =>
      f.status === 'Ativo' && f.cargo.toLowerCase().includes('veterinário')
    ).length;
  }

  get equipeApoio(): number {
    return this.funcionarios.filter(f =>
      f.cargo !== 'Veterinário Sênior' && f.cargo !== 'Cirurgião Vet'
    ).length;
  }

  get funcionariosFiltrados(): Funcionario[] {
    return this.funcionarios.filter(funcionario => {
      const termo = this.busca.toLowerCase();

      const buscaOk =
        funcionario.nome.toLowerCase().includes(termo) ||
        funcionario.email.toLowerCase().includes(termo) ||
        funcionario.cargo.toLowerCase().includes(termo);

      const cargoOk =
        this.filtroCargo === 'Todos os Cargos' ||
        funcionario.cargo === this.filtroCargo;

      const statusOk =
        this.filtroStatus === 'Status: Todos' ||
        funcionario.status === this.filtroStatus;

      return buscaOk && cargoOk && statusOk;
    });
  }

  get funcionariosPaginados(): Funcionario[] {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    return this.funcionariosFiltrados.slice(inicio, inicio + this.itensPorPagina);
  }

  get totalPaginas(): number {
    return Math.ceil(this.funcionariosFiltrados.length / this.itensPorPagina) || 1;
  }

  abrirNovoFuncionario(): void {
    this.modoEdicao = false;
    this.funcionarioForm = this.criarFuncionarioVazio();
    this.modalAberto = true;
  }

  editarFuncionario(funcionario: Funcionario): void {
    this.modoEdicao = true;
    this.funcionarioForm = { ...funcionario };
    this.modalAberto = true;
  }

  salvarFuncionario(): void {
    if (!this.funcionarioForm.nome || !this.funcionarioForm.email || !this.funcionarioForm.telefone) {
      alert('Preencha os campos obrigatórios.');
      return;
    }

    if (this.modoEdicao) {
      this.funcionarios = this.funcionarios.map(f =>
        f.id === this.funcionarioForm.id ? { ...this.funcionarioForm } : f
      );
    } else {
      this.funcionarioForm.id = this.gerarId();
      this.funcionarioForm.avatar = 'assets/img/func1.png';
      this.funcionarios.unshift({ ...this.funcionarioForm });
    }

    this.fecharModal();
  }

  modalRHAberto = false;

  falarComRH(): void {
    this.modalRHAberto = true;
  }

  fecharModalRH(): void {
    this.modalRHAberto = false;
  }

  excluirFuncionario(funcionario: Funcionario): void {
    const confirmar = confirm(`Deseja excluir ${funcionario.nome}?`);

    if (confirmar) {
      this.funcionarios = this.funcionarios.filter(f => f.id !== funcionario.id);

      if (this.paginaAtual > this.totalPaginas) {
        this.paginaAtual = this.totalPaginas;
      }
    }
  }

  limparFiltros(): void {
    this.busca = '';
    this.filtroCargo = 'Todos os Cargos';
    this.filtroStatus = 'Status: Todos';
    this.paginaAtual = 1;
  }

  mudarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaAtual = pagina;
    }
  }

  fecharModal(): void {
    this.modalAberto = false;
  }

  abrirManual(): void {
    alert('Manual do colaborador aberto.');
  }

  private criarFuncionarioVazio(): Funcionario {
    return {
      id: '',
      nome: '',
      cargo: 'Veterinário Sênior',
      email: '',
      telefone: '',
      status: 'Ativo',
      avatar: 'assets/img/func1.png'
    };
  }

  private gerarId(): string {
    const numero = Math.floor(4000 + Math.random() * 999);
    return `#PV-${numero}`;
  }
}