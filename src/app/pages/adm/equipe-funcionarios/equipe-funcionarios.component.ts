import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface Funcionario {
  id: number | string;
  nome: string;
  sobrenome: string;
  cargo: string;
  email: string;
  status: 'Ativo' | 'Inativo';
  avatar: string | null;
  senha?: string;
}

@Component({
  selector: 'app-equipe-funcionarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './equipe-funcionarios.component.html',
  styleUrl: './equipe-funcionarios.component.css'
})
export class EquipeFuncionariosComponent implements OnInit {
  busca = '';
  filtroCargo = 'Todos os Cargos';
  filtroStatus = 'Status: Todos';

  paginaAtual = 1;
  itensPorPagina = 4;

  modalAberto = false;
  modoEdicao = false;
  salvando = false;


  mensagemErro = '';
  mensagemSucesso = '';

  funcionarioForm: Funcionario = this.criarFuncionarioVazio();
  funcionarios: Funcionario[] = [];

  fotoPreview: string | ArrayBuffer | null = null;
  fotoArquivo: File | null = null;
  modalRHAberto = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.carregarFuncionarios();
  }

  carregarFuncionarios(): void {
    this.http.get(`${environment.apiUrl}/adm/listar/funcionario`, { withCredentials: true }).subscribe({
      next: (response: any) => {
        if (response && response.funcionarios) {
          this.funcionarios = response.funcionarios.map((f: any) => ({
            id: f.id_funcionario,
            nome: f.nome,
            sobrenome: f.sobrenome || '',
            cargo: f.especialidade,
            email: f.email,
            status: f.ativo ? 'Ativo' : 'Inativo',
            avatar: f.foto_url
          }));
        }
      },
      error: (err) => console.error('Erro ao buscar funcionários:', err)
    });
  }

  get totalFuncionarios(): number {
    return this.funcionarios.length;
  }

  get veterinariosAtivos(): number {
    return this.funcionarios.filter(f =>
      f.status === 'Ativo' && f.cargo === 'veterinario'
    ).length;
  }

  get equipeApoio(): number {
    return this.funcionarios.filter(f =>
      f.cargo !== 'veterinario'
    ).length;
  }

  get funcionariosFiltrados(): Funcionario[] {
    return this.funcionarios.filter(funcionario => {
      const termo = this.busca.toLowerCase().trim();

      const buscaOk =
        funcionario.nome.toLowerCase().includes(termo) ||
        funcionario.sobrenome.toLowerCase().includes(termo) ||
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

  carregarFoto(event: Event): void {
    this.mensagemErro = '';
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const arquivo = input.files[0];
    if (!arquivo.type.startsWith('image/')) {
      this.mensagemErro = 'Selecione um arquivo de imagem válido (.jpg, .png, .webp).';
      return;
    }

    this.fotoArquivo = arquivo;
    const reader = new FileReader();
    reader.onload = () => { this.fotoPreview = reader.result; };
    reader.readAsDataURL(arquivo);
  }

  abrirNovoFuncionario(): void {
    this.modoEdicao = false;
    this.fotoArquivo = null;
    this.fotoPreview = null;
    this.mensagemErro = '';
    this.mensagemSucesso = '';
    this.funcionarioForm = this.criarFuncionarioVazio();
    this.modalAberto = true;
  }

  editarFuncionario(funcionario: Funcionario): void {
    this.modoEdicao = true;
    this.fotoArquivo = null;
    this.mensagemErro = '';
    this.mensagemSucesso = '';
    this.fotoPreview = funcionario.avatar;
    this.funcionarioForm = { ...funcionario, senha: '' };
    this.modalAberto = true;
  }

  salvarFuncionario(): void {
    this.mensagemErro = '';
    this.mensagemSucesso = '';

    if (!this.funcionarioForm.nome || !this.funcionarioForm.sobrenome || !this.funcionarioForm.email) {
      this.mensagemErro = 'Preencha todos os campos obrigatórios (Nome, Sobrenome e E-mail).';
      return;
    }

    const emailFormatado = this.funcionarioForm.email.trim().toLowerCase();
    if (!emailFormatado.endsWith('@petvitalizfuncionario.com')) {
      this.mensagemErro = 'O e-mail deve ser corporativo contendo o final @petvitalizfuncionario.com';
      return;
    }

    if (!this.modoEdicao && (!this.funcionarioForm.senha || this.funcionarioForm.senha.length < 6)) {
      this.mensagemErro = 'A senha é obrigatória e deve possuir no mínimo 6 dígitos.';
      return;
    }

    this.salvando = true;

    const formData = new FormData();
    formData.append('nome', this.funcionarioForm.nome.trim());
    formData.append('sobrenome', this.funcionarioForm.sobrenome.trim());
    formData.append('email', emailFormatado);
    formData.append('especialidade', this.funcionarioForm.cargo);
    formData.append('ativo', String(this.funcionarioForm.status === 'Ativo'));
    formData.append('senha', this.funcionarioForm.senha || '');

    if (this.fotoArquivo) {
      formData.append('image', this.fotoArquivo);
    }

    if (this.modoEdicao) {
      this.http.put(`${environment.apiUrl}/adm/listar/funcionario/editar/${this.funcionarioForm.id}`, formData, { withCredentials: true }).subscribe({
        next: () => {
          this.mensagemSucesso = 'Colaborador atualizado com sucesso!';
          setTimeout(() => this.finalizarSalvar(), 1200);
        },
        error: (err) => {
          this.salvando = false;
          console.error(err);
          this.mensagemErro = err.error || err.error?.mensagem || 'Erro ao salvar alterações.';
        }
      });
    } else {
      this.http.post(`${environment.apiUrl}/adm/listar/funcionario/cadastrar`, formData, { withCredentials: true }).subscribe({
        next: () => {
          this.mensagemSucesso = 'Colaborador registrado com sucesso!';
          setTimeout(() => this.finalizarSalvar(), 1200);
        },
        error: (err) => {
          this.salvando = false;
          console.error(err);
          this.mensagemErro = typeof err.error === 'string' ? err.error : (err.error?.mensagem || 'Falha ao registrar colaborador.');
        }
      });
    }
  }

  private finalizarSalvar() {
    this.modalAberto = false;
    this.fotoArquivo = null;
    this.fotoPreview = null;
    this.mensagemErro = '';
    this.mensagemSucesso = '';
    this.salvando = false;
    this.carregarFuncionarios();
  }

  modalRHAberto = false;

  falarComRH(): void {
    this.modalRHAberto = true;
  }

  fecharModalRH(): void {
    this.modalRHAberto = false;
  }

  excluirFuncionario(funcionario: Funcionario): void {
    if (confirm(`Tem certeza que deseja remover ${funcionario.nome} do sistema?`)) {
      this.http.delete(`${environment.apiUrl}/adm/listar/funcionario/excluir/${funcionario.id}`, { withCredentials: true }).subscribe({
        next: () => {
          this.carregarFuncionarios();
        },
        error: (err) => console.error(err)
      });
    }
  }

  limparFiltros(): void {
    this.busca = '';
    this.filtroCargo = 'Todos os Cargos';
    this.filtroStatus = 'Status: Todos';
    this.paginaAtual = 1;
  }

  mudarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) this.paginaAtual = pagina;
  }

  fecharModal(): void { this.modalAberto = false; }
  falarComRH(): void { this.modalRHAberto = true; }
  fecharModalRH(): void { this.modalRHAberto = false; }
  abrirManual(): void { alert('Manual do colaborador aberto.'); }

  private criarFuncionarioVazio(): Funcionario {
    return { id: '', nome: '', sobrenome: '', cargo: 'veterinario', email: '', status: 'Ativo', avatar: null, senha: '' };
  }
}