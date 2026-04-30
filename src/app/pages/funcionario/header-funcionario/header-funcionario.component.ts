import { Component } from '@angular/core';
import { NgIf, CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header-funcionario',
  standalone: true,
  imports: [NgIf, CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header-funcionario.component.html',
  styleUrl: './header-funcionario.component.css'
})
export class HeaderFuncionarioComponent {
  isMenuOpen = false;
  isMobileMenuOpen = false;

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  logout() {
    console.log('Logout executado');
  }
}