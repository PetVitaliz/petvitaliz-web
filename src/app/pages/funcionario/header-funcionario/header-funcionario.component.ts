import { Component, HostListener, OnInit } from '@angular/core';
import { NgIf, CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';

@Component({
  selector: 'app-header-funcionario',
  standalone: true,
  imports: [
    NgIf,
    CommonModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './header-funcionario.component.html',
  styleUrl: './header-funcionario.component.css'
})
export class HeaderFuncionarioComponent implements OnInit {

  isMenuOpen = false;
  isMobileMenuOpen = false;

  fotoPerfil = 'assets/img/veterinario.png';

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.carregarFotoPerfil();
  }

  carregarFotoPerfil(): void {
    const fotoSalva = localStorage.getItem('fotoFuncionario');
    this.fotoPerfil = fotoSalva || 'assets/img/veterinario.png';
  }

  toggleMenu(event: Event): void {
    event.stopPropagation();
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  closeAllMenus(): void {
    this.isMenuOpen = false;
    this.isMobileMenuOpen = false;
  }

  logout(): void {
    localStorage.removeItem('usuarioLogado');
    this.closeAllMenus();
    this.router.navigate(['/']);
  }

  @HostListener('document:click')
  closeDropdowns(): void {
    this.isMenuOpen = false;
  }

  @HostListener('window:fotoFuncionarioAtualizada')
  atualizarFotoHeader(): void {
    this.carregarFotoPerfil();
  }

}