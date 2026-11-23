import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

// Pergunta "sair da conta?" num card do próprio site (no lugar do confirm do navegador)
@Injectable({ providedIn: 'root' })
export class SairService {
  aberto = false;
  saindo = false;

  constructor(private http: HttpClient, private router: Router) {}

  get nome(): string {
    try {
      const u = JSON.parse(localStorage.getItem('usuarioLogado') || 'null');
      return String(u?.nome || '').trim().split(' ')[0];
    } catch {
      return '';
    }
  }

  pedir(): void {
    this.aberto = true;
  }

  cancelar(): void {
    if (!this.saindo) this.aberto = false;
  }

  confirmar(): void {
    this.saindo = true;
    const terminar = () => {
      localStorage.removeItem('usuarioLogado');
      this.saindo = false;
      this.aberto = false;
      this.router.navigate(['/']);
    };
    this.http.get(`${environment.apiUrl}/user/logout`, { withCredentials: true }).subscribe({
      next: terminar,
      error: terminar
    });
  }
}
