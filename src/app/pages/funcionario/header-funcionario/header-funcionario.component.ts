import { Component } from '@angular/core';
import { NgIf, CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';

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

<<<<<<< HEAD
  constructor(private router: Router) { }
=======
  constructor(private router: Router) {}
>>>>>>> 44eeca2f2ddc344f8c8e427a26b436475878460d

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
<<<<<<< HEAD
    localStorage.removeItem('usuarioLogado');
=======
>>>>>>> 44eeca2f2ddc344f8c8e427a26b436475878460d
    this.router.navigate(['/']);
  }
}