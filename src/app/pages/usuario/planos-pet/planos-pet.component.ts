import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-planos-pet',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './planos-pet.component.html',
  styleUrl: './planos-pet.component.css'
})
export class PlanosPetComponent implements OnInit {

  planoSelecionado: any = null;
  planos: any[] = [];
  carregandoPlanos = true;

  constructor(private router: Router, private http: HttpClient) { }

  ngOnInit(): void {
    this.buscarPlanosDoBanco();
  }

  buscarPlanosDoBanco(): void {
    this.carregandoPlanos = true;
    this.http.get(`${environment.apiUrl}/adm/listar/produtos`, { withCredentials: true }).subscribe({
      next: (response: any) => {
        if (response && response.produtos) {
          this.planos = response.produtos.map((p: any, index: number) => {
            const partesNome = p.nome.split(' | ');
            const nomeReal = partesNome[0];
            const tagReal = partesNome[1] || 'ATIVO';

            const beneficiosListados = p.beneficios 
              ? p.beneficios.split(/[\n,;]+/).map((b: string) => b.trim()).filter((b: string) => b.length > 0)
              : [];

            return {
              id_produto: p.id_produto,
              tag: tagReal,
              nome: nomeReal,
              preco: `R$ ${p.preco}`,
              descricao: p.descricao || 'Plano de saúde preventivo adaptado para as necessidades do seu pet.',
              recomendado: tagReal === 'RECOMENDADO' || index === 2,
              beneficios: beneficiosListados,
              detalhes: beneficiosListados.length > 0 ? beneficiosListados : ['Atendimento Clínico', 'Suporte Especializado']
            };
          });
        }
        this.carregandoPlanos = false;
      },
      error: (err) => {
        console.error('Erro ao listar produtos na tela planos-pet:', err);
        this.carregandoPlanos = false;
      }
    });
  }

  abrirDetalhes(plano: any): void {
    this.planoSelecionado = plano;
  }

  fecharDetalhes(): void {
    this.planoSelecionado = null;
  }

  concluirPlano(): void {
    if (!this.planoSelecionado) return;

    localStorage.setItem(
      'planoSelecionado',
      JSON.stringify(this.planoSelecionado)
    );

    this.router.navigate(['/user/contrato-plano']);
  }
}