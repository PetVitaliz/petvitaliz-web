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

<<<<<<< HEAD
  constructor(private router: Router) { }
=======
  constructor(private router: Router) {}
>>>>>>> 44eeca2f2ddc344f8c8e427a26b436475878460d

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
<<<<<<< HEAD
    localStorage.removeItem('usuarioLogado');
=======
>>>>>>> 44eeca2f2ddc344f8c8e427a26b436475878460d
    this.router.navigate(['/']);
  }

  @HostListener('document:click')
  fecharTudo() {
    this.adminsAberto = false;
    this.perfilAberto = false;
    this.menuAberto = false;
  }
}