import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-reset-senha',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reset-senha.component.html',
  styleUrl: './reset-senha.component.css'
})
export class ResetSenhaComponent {
  senha = '';
  confirmarSenha = '';

  senhaVisivel = false;
  confirmarVisivel = false;

  erro = '';
  sucesso = '';
  carregando = false;

  constructor(private router: Router, private http: HttpClient) {}

  redefinirSenha() {
    this.erro = '';
    this.sucesso = '';

    if (!this.senha || !this.confirmarSenha) {
      this.erro = 'Preencha todos os campos.';
      return;
    }

    if (this.senha.length < 6) {
      this.erro = 'A senha precisa ter pelo menos 6 caracteres.';
      return;
    }

    if (this.senha !== this.confirmarSenha) {
      this.erro = 'As senhas não conferem.';
      return;
    }

    this.carregando = true;

    const tokenReset = localStorage.getItem('tokenResetJWT');
    
    const httpOptions = {
      withCredentials: true,
      headers: new HttpHeaders({
        'Authorization': tokenReset ? `Bearer ${tokenReset}` : ''
      })
    };

    const dadosPayload = {
      senha1: this.senha.trim(),
      senha2: this.confirmarSenha.trim()
    };

    this.http.put(`${environment.apiUrl}/user/login/alterar-senha`, dadosPayload, httpOptions)
      .subscribe({
        next: () => {
          this.carregando = false;
          this.sucesso = 'Senha redefinida com sucesso!';
          
          localStorage.removeItem('tokenResetJWT');

          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 1500);
        },
        error: (err) => {
          this.carregando = false;
          console.error(err);
          this.erro = err.error || err.error?.mensagem || 'Não foi possível redefinir sua senha. Tente novamente.';
        }
      });
  }
}
