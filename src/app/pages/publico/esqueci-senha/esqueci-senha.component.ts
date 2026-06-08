import { Component } from '@angular/core';
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
  styleUrl: './esqueci-senha.component.css'
})
export class EsqueciSenhaComponent {
  email = '';
  codigoOtp = '';
  enviouCodigo = false;

  erro = '';
  sucesso = '';
  carregando = false;

  constructor(private router: Router, private http: HttpClient) {}

  enviarLink() {
    this.erro = '';
    this.sucesso = '';

    if (!this.email.trim()) {
      this.erro = 'Por favor, digite seu e-mail.';
      return;
    }

    this.carregando = true;

    this.http.post(`${environment.apiUrl}/user/login/esqueci-a-senha`, { email: this.email.trim().toLowerCase() })
      .subscribe({
        next: (response: any) => {
          this.carregando = false;
          this.enviouCodigo = true;
          this.sucesso = 'Código de verificação enviado para o seu e-mail!';
        },
        error: (err) => {
          this.carregando = false;
          console.error(err);
          this.erro = err.error?.mensagem || 'E-mail não encontrado ou erro no servidor.';
        }
      });
  }

  verificarCodigo() {
    this.erro = '';
    this.sucesso = '';

    if (!this.codigoOtp.trim()) {
      this.erro = 'Informe o código recebido por e-mail.';
      return;
    }

    this.carregando = true;

    this.http.post(`${environment.apiUrl}/user/login/esqueci-a-senha-confirmar`, { codigo: this.codigoOtp.trim() }, { withCredentials: true })
      .subscribe({
        next: (response: any) => {
          this.carregando = false;
          this.sucesso = 'Código validado! Redirecionando...';
          

          if (response && response.token_reset) {
            localStorage.setItem('tokenResetJWT', response.token_reset);
          }

          setTimeout(() => {
            this.router.navigate(['/reset-senha']);
          }, 1200);
        },
        error: (err) => {
          this.carregando = false;
          console.error(err);
          this.erro = err.error?.mensagem || 'Código inválido ou expirado.';
        }
      });
  }
}
