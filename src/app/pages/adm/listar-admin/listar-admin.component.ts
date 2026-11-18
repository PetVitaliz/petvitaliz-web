import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-listar-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './listar-admin.component.html',
  styleUrl: './listar-admin.component.css'
})
export class ListarAdminComponent implements OnInit {
  filtroStatus = 'Todos';
  termoBusca = '';
  paginaAtual = 1;
  itensPorPagina = 4;

  adminEditando: any = null;
  tituloModal = 'Editar Administrador';
  isNovoAdmin = false;

  administradores: any[] = [];
  carregando = false;
  salvando = false;

  fotoPreview: string | ArrayBuffer | null = null;
  fotoArquivo: File | null = null;

  adminParaExcluir: any = null;
  toast: { texto: string; tipo: 'ok' | 'erro' } | null = null;
  private toastTimer: any;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.carregarAdministradores();
  }

  carregarAdministradores(): void {
    this.carregando = true;
    this.http.get(`${environment.apiUrl}/adm/listar/adm`, { withCredentials: true }).subscribe({
      next: (response: any) => {
        if (response && response.ADMs) {
          this.administradores = response.ADMs.map((adm: any) => ({
            id: adm.ADM_ID,
            nome: adm.ADM_NOME,
            email: adm.ADM_EMAIL,
            status: adm.ADM_ATIVO ? 'Ativo' : 'Inativo',
            foto_url: adm.ADM_FOTO_URL,
            acesso: 'TOTAL',
            cargo: 'TI / Gerência'
          }));
        }
        this.carregando = false;
      },
      error: (err) => {
        console.error('Erro ao listar administradores:', err);
        this.carregando = false;
      }
    });
  }

  get totalAtivos() {
    return this.administradores.filter(admin => admin.status === 'Ativo').length;
  }

  get adminsFiltrados() {
    const termo = this.termoBusca.toLowerCase().trim();
    return this.administradores.filter(admin => {
      const statusOk = this.filtroStatus === 'Todos' || admin.status === this.filtroStatus;
      const buscaOk =
        admin.nome.toLowerCase().includes(termo) ||
        admin.email.toLowerCase().includes(termo) ||
        String(admin.id).includes(termo);
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

  carregarFoto(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const arquivo = input.files[0];
    if (!arquivo.type.startsWith('image/')) {
      this.avisar('Selecione uma imagem válida.', 'erro');
      return;
    }

    this.fotoArquivo = arquivo;
    const reader = new FileReader();
    reader.onload = () => {
      this.fotoPreview = reader.result;
    };
    reader.readAsDataURL(arquivo);
  }

  novoAdministrador() {
    this.tituloModal = 'Novo Administrador';
    this.isNovoAdmin = true;
    this.fotoPreview = null;
    this.fotoArquivo = null;

    this.adminEditando = {
      nome: '',
      email: '',
      senha: '',
      status: 'Ativo'
    };
  }

  editarAdmin(id: number) {
    const adminEncontrado = this.administradores.find(admin => admin.id === id);
    if (adminEncontrado) {
      this.tituloModal = 'Editar Administrador';
      this.isNovoAdmin = false;
      this.fotoArquivo = null;
      this.fotoPreview = adminEncontrado.foto_url;
      this.adminEditando = { ...adminEncontrado, senha: '' };
    }
  }

  salvarEdicao() {
    if (!this.adminEditando.nome || !this.adminEditando.email) {
      this.avisar('Preencha os campos obrigatórios (Nome e E-mail).', 'erro');
      return;
    }

    const emailFormatado = this.adminEditando.email.trim().toLowerCase();
    if (!emailFormatado.endsWith('@petvitaliz.com')) {
      this.avisar('Apenas e-mails corporativos (@petvitaliz.com) podem ser cadastrados como Administrador.', 'erro');
      return;
    }

    if (this.isNovoAdmin && (!this.adminEditando.senha || this.adminEditando.senha.length < 6)) {
      this.avisar('A senha é obrigatória e deve conter pelo menos 6 caracteres para novos cadastros.', 'erro');
      return;
    }

    this.salvando = true;

    const formData = new FormData();
    formData.append('username', this.adminEditando.nome.trim());
    formData.append('email', emailFormatado);
    formData.append('senha', this.adminEditando.senha || '');
    formData.append('ativo', String(this.adminEditando.status === 'Ativo'));
    
    if (this.fotoArquivo) {
      formData.append('image', this.fotoArquivo);
    }

    if (this.isNovoAdmin) {
      this.http.post(`${environment.apiUrl}/adm/listar/adm/cadastrar`, formData, { withCredentials: true }).subscribe({
        next: () => {
          this.avisar('Administrador cadastrado com sucesso', 'ok');
          this.finalizarSalvar();
        },
        error: (err) => {
          this.salvando = false;
          console.error(err);
          this.avisar(err.error || 'Erro ao cadastrar novo administrador.', 'erro');
        }
      });
    } else {
      this.http.put(`${environment.apiUrl}/adm/listar/adm/editar/${this.adminEditando.id}`, formData, { withCredentials: true }).subscribe({
        next: () => {
          this.avisar('Administrador atualizado com sucesso', 'ok');
          this.finalizarSalvar();
        },
        error: (err) => {
          this.salvando = false;
          console.error(err);
          this.avisar(err.error?.mensagem || 'Erro ao atualizar informações.', 'erro');
        }
      });
    }
  }

  private finalizarSalvar() {
    this.adminEditando = null;
    this.fotoArquivo = null;
    this.fotoPreview = null;
    this.salvando = false;
    this.carregarAdministradores();
  }

  cancelarEdicao() {
    this.adminEditando = null;
    this.fotoArquivo = null;
    this.fotoPreview = null;
  }

  excluirAdmin(id: number) {
    this.adminParaExcluir = this.administradores.find(a => a.id === id) || { id, nome: 'este administrador' };
  }

  cancelarExclusao() {
    this.adminParaExcluir = null;
  }

  confirmarExclusao() {
    const id = this.adminParaExcluir?.id;
    this.adminParaExcluir = null;

    if (id !== undefined && id !== null) {
      this.http.delete(`${environment.apiUrl}/adm/listar/adm/excluir/${id}`, { withCredentials: true }).subscribe({
        next: () => {
          this.avisar('Administrador removido com sucesso.', 'ok');
          this.carregarAdministradores();
        },
        error: (err) => {
          console.error(err);
          this.avisar('Erro ao excluir o registro.', 'erro');
        }
      });
    }
  }

  avisar(texto: any, tipo: 'ok' | 'erro') {
    this.toast = { texto: typeof texto === 'string' ? texto : 'Ocorreu um erro inesperado.', tipo };
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toast = null, 3500);
  }

  get totalInativos() {
    return this.administradores.filter(admin => admin.status === 'Inativo').length;
  }

  iniciais(nome: string): string {
    const partes = (nome || '').trim().split(/[\s_.]+/).filter(Boolean);
    if (partes.length === 0) return 'AD';
    if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
    return (partes[0].charAt(0) + partes[partes.length - 1].charAt(0)).toUpperCase();
  }

  paginaAnterior() { if (this.paginaAtual > 1) this.paginaAtual--; }
  proximaPagina() { if (this.paginaAtual < this.totalPaginas) this.paginaAtual++; }
}