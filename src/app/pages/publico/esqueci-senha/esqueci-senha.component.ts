import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-esqueci-senha',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './esqueci-senha.component.html',
  styleUrl: './esqueci-senha.component.css'
})
export class EsqueciSenhaComponent {
  email = '';
  erro = '';
  sucesso = '';

  constructor(private router: Router) {}

  enviarLink() {
    this.erro = '';
    this.sucesso = '';

    if (!this.email) {
      this.erro = 'Digite seu e-mail.';
      return;
    }

    this.sucesso = 'Link enviado! Redirecionando...';

    setTimeout(() => {
      this.router.navigate(['/usuario/reset-senha']);
    }, 1200);
  }
}