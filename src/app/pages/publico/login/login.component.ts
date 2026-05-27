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

  constructor(private router: Router, private http: HttpClient) {}

  entrar() {
    this.erro = '';

    if (!this.email || !this.senha) {
      this.erro = 'Preencha e-mail e senha.';
      return;
    }

    const emailDigitado = this.email.trim().toLowerCase();
    const senhaDigitada = this.senha.trim();

    if (emailDigitado === 'admin@petvitaliz.com' && senhaDigitada === 'admin123') {
      localStorage.setItem('usuarioLogado', JSON.stringify({
        nome: 'Dr. Ricardo Silva',
        email: emailDigitado,
        tipo: 'admin'
      }));
      this.router.navigate(['/adm/home']);
      return;
    }

    if (emailDigitado === 'funcionario@petvitaliz.com' && senhaDigitada === 'func123') {
      localStorage.setItem('usuarioLogado', JSON.stringify({
        nome: 'Funcionário PetVitaliz',
        email: emailDigitado,
        tipo: 'funcionario'
      }));
      this.router.navigate(['/funcionario/home']);
      return;
    }

    const dadosLogin = {
      email: emailDigitado,
      senha: senhaDigitada
    };

    this.http.post(`${environment.apiUrl}/user/login`, dadosLogin, {
      withCredentials: true
    })
    .subscribe({
      next: (response: any) => {
        const usuarioParaSalvar = response.usuario || {
          nome: emailDigitado.split('@')[0],
          email: emailDigitado,
          tipo: 'usuario'
        };

        localStorage.setItem('usuarioLogado', JSON.stringify(usuarioParaSalvar));
        
        this.router.navigate(['/user/home']); 
      },
      error: (err) => {
        console.error("Erro no fluxo de login:", err);
        
        if (err.error) {
          this.erro = err.error.mensagem || err.error.message;
        } 
        
        if (!this.erro && typeof err.error === 'string') {
          this.erro = err.error;
        } 
        
        if (!this.erro) {
          this.erro = 'Não foi possível conectar ao servidor do PetVitaliz.';
        }
      }
    });
  }
}