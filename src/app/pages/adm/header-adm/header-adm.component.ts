import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';

@Component({
  selector: 'app-header-adm',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header-adm.component.html',
  styleUrl: './header-adm.component.css'
})
export class HeaderAdmComponent {

  adminsAberto = false;
  perfilAberto = false;
  menuAberto = false;

  constructor(private router: Router) {}

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
    this.router.navigate(['/']);
  }

  @HostListener('document:click')
  fecharTudo() {
    this.adminsAberto = false;
    this.perfilAberto = false;
    this.menuAberto = false;
  }
}