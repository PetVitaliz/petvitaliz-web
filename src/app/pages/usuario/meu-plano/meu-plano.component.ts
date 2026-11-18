import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { formatarPreco, nomeDoPlano } from '../../../core/utils/formato-plano';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-meu-plano',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './meu-plano.component.html',
  styleUrl: './meu-plano.component.css'
})
export class MeuPlanoComponent implements OnInit {

  planos: any[] = [];
  erro: string = '';
  carregando: boolean = true;
  cancelandoPet: number | null = null;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.buscarPlanoAtivo();
  }

  buscarPlanoAtivo(): void {
    this.carregando = true;
    this.erro = '';

    forkJoin({
      planos: this.http.get<any>(`${environment.apiUrl}/user/planos`, { withCredentials: true }),
      pets: this.http.get<any>(`${environment.apiUrl}/user/listar/pet`, { withCredentials: true })
    }).subscribe({
      next: ({ planos, pets }) => {
        this.carregando = false;
        const listaPets: any[] = pets?.pets || pets?.Pets || [];
        this.planos = (planos?.planos || []).map((p: any) => {
          const produto = p.produto || {};
          return {
            ...produto,
            id_pet: p.id_pet,
            nomePet: listaPets.find(pet => pet.id_pet === p.id_pet)?.nome || 'Pet',
            nome: nomeDoPlano(produto.nome),
            preco: formatarPreco(produto.preco),
            listaBeneficios: typeof produto.beneficios === 'string'
              ? produto.beneficios.split(/[\n;]+/).map((b: string) => b.trim()).filter((b: string) => b.length > 0)
              : []
          };
        });
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

  cancelarPlano(plano: any): void {
    if (this.cancelandoPet !== null) return;

    if (confirm(`Deseja realmente cancelar o plano de ${plano.nomePet}? Esta ação removerá a cobertura do pet.`)) {
      this.cancelandoPet = plano.id_pet;
      this.erro = '';

      this.http.delete(`${environment.apiUrl}/user/planos/cancelar/${plano.id_pet}`, { withCredentials: true }).subscribe({
        next: (response: any) => {
          this.cancelandoPet = null;
          this.planos = this.planos.filter(p => p.id_pet !== plano.id_pet);
          alert(response.mensagem || 'Plano cancelado com sucesso.');
        },
        error: (err) => {
          this.cancelandoPet = null;
          console.error('Erro ao cancelar plano:', err);
          this.erro = err.error?.mensagem || 'Erro interno ao processar o cancelamento.';
        }
      });
    }
  }
}
