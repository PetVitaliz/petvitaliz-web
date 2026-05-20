import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminsService } from '../../../core/services/admins.service';

@Component({
  selector: 'app-listar-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './listar-admin.component.html',
  styleUrl: './listar-admin.component.css'
})
export class ListarAdminComponent {
  filtroStatus = 'Todos';
  termoBusca = '';
  paginaAtual = 1;
  itensPorPagina = 4;

  adminEditando: any = null;
  tituloModal = 'Editar Administrador';

  administradores: any[] = [];

  constructor(private adminsService: AdminsService) {
    this.administradores = this.adminsService.listarAdmins();
  }

  get totalAtivos() {
    return this.administradores.filter(admin => admin.status === 'Ativo').length;
  }

  get adminsFiltrados() {
    const termo = this.termoBusca.toLowerCase().trim();

    return this.administradores.filter(admin => {
      const statusOk =
        this.filtroStatus === 'Todos' || admin.status === this.filtroStatus;

      const buscaOk =
        admin.nome.toLowerCase().includes(termo) ||
        admin.email.toLowerCase().includes(termo) ||
        admin.cargo.toLowerCase().includes(termo) ||
        admin.id.toLowerCase().includes(termo);

      return statusOk && buscaOk;
    });
  }

  get totalPaginas() {
    return Math.ceil(this.adminsFiltrados.length / this.itensPorPagina) || 1;
  }

  get adminsPaginados() {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    const fim = inicio + this.itensPorPagina;

    return this.adminsFiltrados.slice(inicio, fim);
  }

  alterarFiltro(status: string) {
    this.filtroStatus = status;
    this.paginaAtual = 1;
  }

  novoAdministrador() {
    this.tituloModal = 'Novo Administrador';

    this.adminEditando = {
      id: 'BPV-' + Math.floor(1000 + Math.random() * 9000),
      nome: '',
      email: '',
      cargo: '',
      acesso: 'TOTAL',
      status: 'Ativo',
      imagem: 'assets/img/admin.png'
    };
  }

  editarAdmin(id: string) {
    const adminEncontrado = this.administradores.find(admin => admin.id === id);

    if (adminEncontrado) {
      this.tituloModal = 'Editar Administrador';
      this.adminEditando = { ...adminEncontrado };
    }
  }

  salvarEdicao() {
    if (
      !this.adminEditando.nome ||
      !this.adminEditando.email ||
      !this.adminEditando.cargo
    ) {
      alert('Preencha todos os campos.');
      return;
    }

    const index = this.administradores.findIndex(
      admin => admin.id === this.adminEditando.id
    );

    if (index !== -1) {
      this.administradores[index] = { ...this.adminEditando };
    } else {
      this.administradores.unshift({ ...this.adminEditando });
    }

    this.adminEditando = null;
    this.paginaAtual = 1;
  }

  cancelarEdicao() {
    this.adminEditando = null;
  }

  excluirAdmin(id: string) {
    const confirmar = confirm('Tem certeza que deseja excluir este administrador?');

    if (confirmar) {
      this.adminsService.excluirAdmin(id);
      this.administradores = this.administradores.filter(admin => admin.id !== id);

      if (this.paginaAtual > this.totalPaginas) {
        this.paginaAtual = this.totalPaginas || 1;
      }
    }
  }

  paginaAnterior() {
    if (this.paginaAtual > 1) {
      this.paginaAtual--;
    }
  }

  proximaPagina() {
    if (this.paginaAtual < this.totalPaginas) {
      this.paginaAtual++;
    }
  }
}