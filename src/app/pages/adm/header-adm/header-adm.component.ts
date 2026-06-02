import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-header-adm',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header-adm.component.html',
  styleUrl: './header-adm.component.css'
})
export class HeaderAdmComponent implements OnInit {

  adminsAberto = false;
  perfilAberto = false;
  menuAberto = false;

  nomeAdmin = 'Administrador';
  emailAdmin = '';
  fotoAdmin = '';

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

  toggleMenu(event: Event) {
    event.stopPropagation();
    this.menuAberto = !this.menuAberto;
    this.adminsAberto = false;
    this.perfilAberto = false;
  }

  toggleAdmins(event: Event) {
    event.stopPropagation();
    this.adminsAberto = !this.adminsAberto;
    this.perfilAberto = false;
  }

  togglePerfil(event: Event) {
    event.stopPropagation();
    this.perfilAberto = !this.perfilAberto;
    this.adminsAberto = false;
  }

  fecharMenus() {
    this.menuAberto = false;
    this.adminsAberto = false;
    this.perfilAberto = false;
  }

  logout() {
    this.fecharMenus();

    this.http.get(`${environment.apiUrl}/user/logout`, { withCredentials: true }).subscribe({
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

  @HostListener('document:click')
  fecharTudo() {
    this.adminsAberto = false;
    this.perfilAberto = false;
    this.menuAberto = false;
  }
}