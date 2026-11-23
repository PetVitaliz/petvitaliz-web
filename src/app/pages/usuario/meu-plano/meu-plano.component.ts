import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { PlanoMontado, montarPlano, moeda } from '../../../core/utils/montar-plano';
import { PlanosCarrosselComponent } from '../../../components/planos-carrossel/planos-carrossel.component';

interface PlanoAtivo {
  id_pet: number;
  nomePet: string;
  plano: PlanoMontado;
}

@Component({
  selector: 'app-meu-plano',
  standalone: true,
  imports: [CommonModule, RouterModule, PlanosCarrosselComponent],
  templateUrl: './meu-plano.component.html',
  styleUrl: './meu-plano.component.css'
})
export class MeuPlanoComponent implements OnInit {

  carregando = true;
  erro = '';
  sucesso = '';

  ativos: PlanoAtivo[] = [];
  pets: any[] = [];
  disponiveis: PlanoMontado[] = [];
  ciclo: 'mensal' | 'anual' = 'mensal';
  cancelandoPet: number | null = null;

  readonly moeda = moeda;

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.carregando = true;
    const opcoes = { withCredentials: true };
    forkJoin({
      planos: this.http.get<any>(`${environment.apiUrl}/user/planos`, opcoes).pipe(catchError((e) => of({ erro: e }))),
      pets: this.http.get<any>(`${environment.apiUrl}/user/listar/pet`, opcoes).pipe(catchError(() => of(null))),
      produtos: this.http.get<any>(`${environment.apiUrl}/adm/listar/produtos`, opcoes).pipe(catchError(() => of(null)))
    }).subscribe(({ planos, pets, produtos }: any) => {
      this.carregando = false;

      this.disponiveis = (produtos?.produtos || [])
        .map((p: any) => montarPlano(p))
        .sort((a: PlanoMontado, b: PlanoMontado) => a.mensal - b.mensal);

      if (planos?.erro && (planos.erro.status === 401 || planos.erro.status === 403)) {
        this.router.navigate(['/login']);
        return;
      }

      this.pets = pets?.pets || pets?.Pets || [];
      this.ativos = (planos?.planos || []).map((p: any) => ({
        id_pet: p.id_pet,
        nomePet: this.pets.find((pet) => pet.id_pet === p.id_pet)?.nome || 'Pet',
        plano: montarPlano(p.produto || {})
      }));
    });
  }

  get petsSemPlano(): any[] {
    return this.pets.filter((p) => !this.ativos.some((a) => a.id_pet === p.id_pet));
  }

  // Escolheu no carrossel: vai para a contratação (igual ao app)
  escolherPlano(p: PlanoMontado): void {
    const pet = Number(this.route.snapshot.queryParamMap.get('pet')) || undefined;
    this.router.navigate(['/user/contratar-plano'], {
      queryParams: { plano: p.id_produto, ciclo: this.ciclo, pet }
    });
  }

  cancelarPlano(a: PlanoAtivo): void {
    if (this.cancelandoPet !== null) return;
    if (!confirm(`Cancelar o ${a.plano.nome} de ${a.nomePet}? O pet perde a cobertura do plano.`)) return;

    this.cancelandoPet = a.id_pet;
    this.erro = '';
    this.http.delete(`${environment.apiUrl}/user/planos/cancelar/${a.id_pet}`, { withCredentials: true }).subscribe({
      next: (res: any) => {
        this.cancelandoPet = null;
        this.ativos = this.ativos.filter((x) => x.id_pet !== a.id_pet);
        this.sucesso = res?.mensagem || 'Plano cancelado.';
      },
      error: (err) => {
        this.cancelandoPet = null;
        this.erro = err.error?.mensagem || 'Não foi possível cancelar o plano.';
      }
    });
  }
}
