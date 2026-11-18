import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface ItemMenu {
  rota: string;
  rotulo: string;
  icone: string;
  exato?: boolean;
}

@Component({
  selector: 'app-header-funcionario',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header-funcionario.component.html',
  styleUrl: './header-funcionario.component.css'
})
export class HeaderFuncionarioComponent implements OnInit {

  menuAberto = false;

  nomeFuncionario = 'Carregando...';
  funcao = 'Colaborador';
  fotoPerfil = '';

  readonly menuPrincipal: ItemMenu[] = [
    { rota: '/funcionario/home', rotulo: 'Painel', icone: 'dashboard', exato: true },
    { rota: '/funcionario/consultas', rotulo: 'Minha agenda', icone: 'agenda' },
    { rota: '/funcionario/clientes', rotulo: 'Clientes e pets', icone: 'pata' }
  ];

  readonly menuConta: ItemMenu[] = [
    { rota: '/funcionario/perfil', rotulo: 'Meu perfil', icone: 'perfil' },
    { rota: '/funcionario/ajuda', rotulo: 'Ajuda e suporte', icone: 'ajuda' }
  ];

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    this.carregarFotoPerfil();
    this.buscarDadosFuncionario();
  }

  buscarDadosFuncionario(): void {
    this.http.get<any>(`${environment.apiUrl}/funcionario/perfil-dados`, { withCredentials: true }).subscribe({
      next: (dados) => {
        const veterinario = dados.especialidade === 'veterinario';
        const prefixo = veterinario ? 'Dr(a).' : 'Prof.';
        const sobrenome = dados.sobrenome ? dados.sobrenome : '';
        this.nomeFuncionario = `${prefixo} ${dados.nome} ${sobrenome}`.trim();
        this.funcao = veterinario ? 'Veterinário(a)' : (dados.especialidade ? this.capitalizar(dados.especialidade) : 'Colaborador');

        if (dados.foto_url) {
          this.fotoPerfil = dados.foto_url;
        }
      },
      error: (err) => {
        console.error('Erro ao buscar dados do funcionário logado:', err);
        this.nomeFuncionario = 'Funcionário';
      }
    });
  }

  carregarFotoPerfil(): void {
    this.fotoPerfil = localStorage.getItem('fotoFuncionario') || '';
  }

  get iniciais(): string {
    const partes = (this.nomeFuncionario || 'FU')
      .replace(/^(Dr\(a\)\.|Prof\.)\s*/, '')
      .trim()
      .split(/\s+/);
    const primeira = partes[0]?.charAt(0) || 'F';
    const ultima = partes.length > 1 ? partes[partes.length - 1].charAt(0) : (partes[0]?.charAt(1) || 'U');
    return (primeira + ultima).toUpperCase();
  }

  toggleMenu(): void {
    this.menuAberto = !this.menuAberto;
  }

  fecharMenus(): void {
    this.menuAberto = false;
  }

  logout(): void {
    this.fecharMenus();
    this.http.post(`${environment.apiUrl}/funcionario/logout`, {}, { withCredentials: true }).subscribe({
      next: () => this.efetuarLogoutLocal(),
      error: (err) => {
        console.error('Erro ao efetuar logout no servidor:', err);
        this.efetuarLogoutLocal();
      }
    });
  }

  private efetuarLogoutLocal(): void {
    localStorage.removeItem('usuarioLogado');
    localStorage.removeItem('fotoFuncionario');
    this.router.navigate(['/login']);
  }

  private capitalizar(texto: string): string {
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }

  @HostListener('window:fotoFuncionarioAtualizada')
  atualizarFotoHeader(): void {
    this.carregarFotoPerfil();
  }
}