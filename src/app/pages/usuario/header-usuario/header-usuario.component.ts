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
  avatarMenuAberto = false;

  constructor(private router: Router) {}

  get usuario() {
    const usuarioLogado = localStorage.getItem('usuarioLogado');
    return usuarioLogado ? JSON.parse(usuarioLogado) : null;
  }

  get inicialUsuario(): string {
    if (!this.usuario) return 'U';
    const nome = this.usuario.nome || this.usuario.nomeCompleto || this.usuario.email || 'Usuario';
    return nome.trim().charAt(0).toUpperCase();
  }

  toggleMenuMobile(): void {
    this.menuMobileAberto = !this.menuMobileAberto;
    this.avatarMenuAberto = false;
  }

  toggleAvatarMenu(): void {
    this.avatarMenuAberto = !this.avatarMenuAberto;
  }

  fecharMenus(): void {
    this.menuMobileAberto = false;
    this.avatarMenuAberto = false;
  }

  sair(): void {
    if (confirm('Deseja realmente fazer logout?')) {
      this.fecharMenus();
      localStorage.removeItem('usuarioLogado');
      this.router.navigate(['/']);
    }
  }
}