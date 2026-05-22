import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-header-usuario',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header-usuario.component.html',
  styleUrl: './header-usuario.component.css'
})
export class HeaderUsuarioComponent {
  menuMobileAberto = false;
  perfilMenuAberto = false;
  avatarMenuAberto = false;
  inicialUsuario = 'U';

  constructor(private router: Router) {
    this.carregarInicialUsuario();
  }

  carregarInicialUsuario(): void {
    const usuarioLogado = localStorage.getItem('usuarioLogado');

    if (!usuarioLogado) return;

    const usuario = JSON.parse(usuarioLogado);
    const nome = usuario.nome || usuario.nomeCompleto || usuario.email || 'Usuario';

    this.inicialUsuario = nome.charAt(0).toUpperCase();
  }

  toggleMenuMobile(): void {
    this.menuMobileAberto = !this.menuMobileAberto;
    this.perfilMenuAberto = false;
    this.avatarMenuAberto = false;
  }

  togglePerfilMenu(): void {
    this.perfilMenuAberto = !this.perfilMenuAberto;
    this.avatarMenuAberto = false;
  }

  toggleAvatarMenu(): void {
    this.avatarMenuAberto = !this.avatarMenuAberto;
    this.perfilMenuAberto = false;
  }

  fecharMenus(): void {
    this.menuMobileAberto = false;
    this.perfilMenuAberto = false;
    this.avatarMenuAberto = false;
  }

  sair(): void {
    localStorage.removeItem('usuarioLogado');
    this.router.navigate(['/']);
  }
}