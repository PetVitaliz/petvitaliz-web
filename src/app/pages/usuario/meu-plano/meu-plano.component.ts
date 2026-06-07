import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-meu-plano',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './meu-plano.component.html',
  styleUrl: './meu-plano.component.css'
})
export class MeuPlanoComponent implements OnInit {

  plano: any = null;
  erro: string = '';
  carregando: boolean = true;
  cancelando: boolean = false;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.buscarPlanoAtivo();
  }

  buscarPlanoAtivo(): void {
    this.carregando = true;
    this.erro = '';

    this.http.get(`${environment.apiUrl}/user/planos`, { withCredentials: true }).subscribe({
      next: (response: any) => {
        this.carregando = false;
        if (response && response.tem_plano) {
          this.plano = response.include;
          
          if (this.plano.beneficios && typeof this.plano.beneficios === 'string') {
            this.plano.listaBeneficios = this.plano.beneficios
              .split(/[\n,;]+/)
              .map((b: string) => b.trim())
              .filter((b: string) => b.length > 0);
          } else {
            this.plano.listaBeneficios = [];
          }
        } else {
          this.plano = null;
        }
      },
      error: (err) => {
        this.carregando = false;
        console.error('Erro ao buscar plano:', err);
        if (err.status === 401 || err.status === 403) {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  cancelarPlano(): void {
    if (this.cancelando) return;

    if (confirm('Deseja realmente cancelar seu plano? Esta ação removerá a cobertura do seu pet.')) {
      this.cancelando = true;
      this.erro = '';

      this.http.delete(`${environment.apiUrl}/user/planos/cancelar`, { withCredentials: true }).subscribe({
        next: (response: any) => {
          this.cancelando = false;
          this.plano = null;
          alert(response.mensagem || 'Plano cancelado com sucesso.');
        },
        error: (err) => {
          this.cancelando = false;
          console.error('Erro ao cancelar plano:', err);
          this.erro = err.error?.mensagem || 'Erro interno ao processar o cancelamento.';
        }
      });
    }
  }
}