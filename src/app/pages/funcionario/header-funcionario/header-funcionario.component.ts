import { Component, HostListener, OnInit } from '@angular/core';
import { NgIf, CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

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
  nomeFuncionario = 'Carregando...';
  fotoPerfil = 'assets/img/veterinario.png';

  constructor(private router: Router, private http: HttpClient) { }

  ngOnInit(): void {
    this.carregarFotoPerfil();
    this.buscarDadosFuncionario();
  }

  buscarDadosFuncionario(): void {
    this.http.get<any>(`${environment.apiUrl}/funcionario/perfil-dados`, { withCredentials: true }).subscribe({
      next: (dados) => {
        const prefixo = dados.especialidade === 'veterinario' ? 'Dr(a).' : 'Prof.'
        
        const sobrenomeFormatado = dados.sobrenome ? dados.sobrenome : '';
        this.nomeFuncionario = `${prefixo} ${dados.nome} ${sobrenomeFormatado}`.trim();

        if (dados.foto_url) {
          this.fotoPerfil = dados.foto_url;
        }
      },
      error: (err) => {
        console.error('Erro ao buscar dados do funcionário logado:', err);
        this.nomeFuncionario = 'Funcionário';
      }
    });
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
    this.http.post(`${environment.apiUrl}/funcionario/logout`, {}, { withCredentials: true }).subscribe({
      next: () => {
        this.efetuarLogoutLocal();
      },
      error: (err) => {
        console.error('Erro ao efetuar logout no servidor:', err);
        this.efetuarLogoutLocal();
      }
    });
  }

  private efetuarLogoutLocal(): void {
    localStorage.removeItem('usuarioLogado');
    localStorage.removeItem('fotoFuncionario');
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