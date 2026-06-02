import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  email = '';
  senha = '';
  erro = '';
  lembrar = false;
  senhaVisivel = false;
  carregando = false;

  constructor(private router: Router, private http: HttpClient) {}

  entrar() {
    this.erro = '';

    if (!this.email || !this.senha) {
      this.erro = 'Preencha as credenciais de acesso e a senha.';
      return;
    }

    const entradaDigitada = this.email.trim().toLowerCase();
    const senhaDigitada = this.senha.trim();
    this.carregando = true;

    if (entradaDigitada.endsWith('@petvitaliz.com') && (entradaDigitada.startsWith('adm') || entradaDigitada.includes('admin'))) {
      this.http.post(`${environment.apiUrl}/user/login/adm`, { email: entradaDigitada, senha: senhaDigitada }, { withCredentials: true })
        .subscribe({
          next: (response: any) => {
            this.carregando = false;
            const usuarioParaSalvar = response.usuario || {
              nome: entradaDigitada.split('@')[0],
              email: entradaDigitada,
              tipo: 'admin'
            };
            localStorage.setItem('usuarioLogado', JSON.stringify(usuarioParaSalvar));
            this.router.navigate(['/adm/home']);
          },
          error: (err) => this.tratarErro(err)
        });
      return;
    }

    if (entradaDigitada.endsWith('@petvitalizfuncionario.com')) {
      this.http.post(`${environment.apiUrl}/user/login/funcionario`, { email: entradaDigitada, senha: senhaDigitada }, { withCredentials: true })
        .subscribe({
          next: (response: any) => {
            this.carregando = false;
            localStorage.setItem('usuarioLogado', JSON.stringify({
              nome: response.nome || 'Colaborador PetVitaliz',
              email: entradaDigitada,
              tipo: 'funcionario'
            }));
            this.router.navigate(['/funcionario/home']);
          },
          error: (err) => this.tratarErro(err)
        });
      return;
    }

    const dadosLogin = {
      email: entradaDigitada,
      senha: senhaDigitada
    };

    this.http.post(`${environment.apiUrl}/user/login`, dadosLogin, { withCredentials: true })
      .subscribe({
        next: (response: any) => {
          this.carregando = false;
          const usuarioParaSalvar = response.usuario || {
            nome: response.nome || entradaDigitada.split('@')[0],
            email: entradaDigitada,
            tipo: 'usuario'
          };
          localStorage.setItem('usuarioLogado', JSON.stringify(usuarioParaSalvar));
          this.router.navigate(['/user/home']); 
        },
        error: (err) => this.tratarErro(err)
      });
  }

  private tratarErro(err: any) {
    this.carregando = false;
    console.error("Erro no fluxo de autenticação:", err);
    
    if (err.error) {
      this.erro = err.error.mensagem || err.error.message || (typeof err.error === 'string' ? err.error : '');
    } 
    
    if (!this.erro) {
      this.erro = 'Credenciais incorretas ou servidor indisponível.';
    }
  }
}