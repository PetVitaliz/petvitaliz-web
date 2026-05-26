import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  
  dropdownAberto = false;

  constructor(private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.dropdownAberto = false;
      this.cdr.detectChanges(); 
    });
  }

  toggleDropdown() {
    this.dropdownAberto = !this.dropdownAberto;
  }

  get usuario() {
    const dados = localStorage.getItem('usuarioLogado');
    if (!dados || dados === 'undefined') return null;
    try {
      return JSON.parse(dados);
    } catch (e) {
      localStorage.removeItem('usuarioLogado');
      return null;
    }
  }

  get inicialNome(): string {
    if (this.usuario && this.usuario.nome) {
      return this.usuario.nome.trim().charAt(0).toUpperCase();
    }
    return '';
  }

  logout() {
    const desejaSair = confirm('Deseja realmente fazer o logout?');

    if (desejaSair) {
      this.dropdownAberto = false;
      localStorage.removeItem('usuarioLogado');
      this.router.navigate(['/']);
    }
  }
}