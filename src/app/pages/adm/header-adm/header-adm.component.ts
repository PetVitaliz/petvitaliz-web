import { Component, OnInit } from '@angular/core';
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
  selector: 'app-header-adm',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header-adm.component.html',
  styleUrl: './header-adm.component.css'
})
export class HeaderAdmComponent implements OnInit {

  menuAberto = false;

  nomeAdmin = 'Administrador';
  emailAdmin = '';
  fotoAdmin = '';

  readonly menuPrincipal: ItemMenu[] = [
    { rota: '/adm/home', rotulo: 'Dashboard', icone: 'dashboard', exato: true },
    { rota: '/adm/consultas', rotulo: 'Consultas', icone: 'agenda', exato: true },
    { rota: '/adm/clientes', rotulo: 'Clientes e pets', icone: 'pata' },
    { rota: '/adm/financeiro', rotulo: 'Financeiro', icone: 'dinheiro' }
  ];

  readonly menuGestao: ItemMenu[] = [
    { rota: '/adm/planos', rotulo: 'Planos', icone: 'escudo' },
    { rota: '/adm/equipe-funcionarios', rotulo: 'Equipe e funcionários', icone: 'equipe' },
    { rota: '/adm/listar/adm/cadastrar', rotulo: 'Administradores', icone: 'chave' }
  ];

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    const usuarioSalvo = localStorage.getItem('usuarioLogado');
    if (usuarioSalvo) {
      const usuario = JSON.parse(usuarioSalvo);
      if (usuario.tipo === 'admin') {
        this.nomeAdmin = usuario.nome;
        this.emailAdmin = usuario.email;
        this.fotoAdmin = usuario.foto_url || usuario.ADM_FOTO_URL || '';
      }
    }
  }

  get iniciais(): string {
    const partes = (this.nomeAdmin || 'AD').trim().split(/\s+/);
    const primeira = partes[0]?.charAt(0) || 'A';
    const ultima = partes.length > 1 ? partes[partes.length - 1].charAt(0) : (partes[0]?.charAt(1) || 'D');
    return (primeira + ultima).toUpperCase();
  }

  toggleMenu(): void {
    this.menuAberto = !this.menuAberto;
  }

  fecharMenus(): void {
    this.menuAberto = false;
  }

  logout() {
    this.fecharMenus();

    this.http.get(`${environment.apiUrl}/adm/logout`, { withCredentials: true }).subscribe({
      next: () => {
        this.limparSessaoLocal();
      },
      error: (err) => {
        console.error('Erro ao realizar logout no servidor:', err);
        this.limparSessaoLocal();
      }
    });
  }

  private limparSessaoLocal() {
    localStorage.removeItem('usuarioLogado');
    this.router.navigate(['/login']);
  }
}