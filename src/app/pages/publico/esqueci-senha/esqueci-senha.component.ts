import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-esqueci-senha',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './esqueci-senha.component.html',
  styleUrls: ['../login/login.component.css', '../recuperar-senha.css']
})
export class EsqueciSenhaComponent implements OnDestroy {
  email = '';
  codigoOtp = '';
  enviouCodigo = false;

  erro = '';
  sucesso = '';
  carregando = false;

  // Tempo para poder pedir outro código
  espera = 0;
  private timer: any;

  constructor(private router: Router, private http: HttpClient) {}

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }

  somenteDigitos(v: string): string {
    return String(v || '').replace(/\D/g, '').slice(0, 6);
  }

  private iniciarEspera(): void {
    clearInterval(this.timer);
    this.espera = 30;
    this.timer = setInterval(() => {
      this.espera--;
      if (this.espera <= 0) clearInterval(this.timer);
    }, 1000);
  }

  enviarLink(): void {
    this.erro = '';
    this.sucesso = '';
    const email = this.email.trim().toLowerCase();

    if (!email) {
      this.erro = 'Digite seu e-mail.';
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.erro = 'Esse e-mail não parece válido. Confira e tente de novo.';
      return;
    }

    this.carregando = true;
    this.http.post(`${environment.apiUrl}/user/login/esqueci-a-senha`, { email }).subscribe({
      next: () => {
        this.carregando = false;
        this.enviouCodigo = true;
        this.codigoOtp = '';
        this.sucesso = 'Código enviado para o seu e-mail.';
        this.iniciarEspera();
      },
      error: (err) => {
        this.carregando = false;
        this.erro = err.error?.mensagem || 'E-mail não encontrado ou erro no servidor.';
      }
    });
  }

  reenviar(): void {
    if (this.espera > 0) return;
    this.enviarLink();
  }

  trocarEmail(): void {
    clearInterval(this.timer);
    this.espera = 0;
    this.enviouCodigo = false;
    this.codigoOtp = '';
    this.erro = '';
    this.sucesso = '';
  }

  verificarCodigo(): void {
    this.erro = '';
    this.sucesso = '';

    if (this.codigoOtp.length < 6) {
      this.erro = 'Digite os 6 dígitos do código.';
      return;
    }

    this.carregando = true;
    this.http.post(`${environment.apiUrl}/user/login/esqueci-a-senha-confirmar`,
      { email: this.email.trim().toLowerCase(), codigo: this.codigoOtp }, { withCredentials: true })
      .subscribe({
        next: (response: any) => {
          this.carregando = false;
          this.sucesso = 'Código confirmado! Agora crie sua nova senha.';
          if (response?.token_reset) {
            localStorage.setItem('tokenResetJWT', response.token_reset);
          }
          setTimeout(() => this.router.navigate(['/reset-senha']), 900);
        },
        error: (err) => {
          this.carregando = false;
          this.erro = err.error?.mensagem || 'Código inválido ou expirado.';
        }
      });
  }
}
