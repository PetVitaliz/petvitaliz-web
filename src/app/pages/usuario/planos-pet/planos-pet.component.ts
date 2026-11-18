import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { formatarPreco, nomeDoPlano } from '../../../core/utils/formato-plano';
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
  
  pets: any[] = [];
  planosPorPet: Record<number, string> = {};
  petEscolhidoId: number | null = null;

  constructor(private router: Router, private route: ActivatedRoute, private http: HttpClient) { }

  ngOnInit(): void {
    this.carregarPetsEPlanos();
    this.buscarPlanosDoBanco();
  }

  carregarPetsEPlanos(): void {
    const petDaUrl = Number(this.route.snapshot.queryParamMap.get('pet')) || null;
    this.http.get<any>(`${environment.apiUrl}/user/listar/pet`, { withCredentials: true }).subscribe({
      next: (res) => {
        this.pets = res?.pets || res?.Pets || [];
        const preferido = this.pets.find(p => p.id_pet === petDaUrl);
        this.petEscolhidoId = (preferido || this.pets.find(p => !this.planosPorPet[p.id_pet]) || this.pets[0])?.id_pet ?? null;
      },
      error: (err) => console.error('Erro ao buscar pets:', err)
    });
    this.http.get<any>(`${environment.apiUrl}/user/planos`, { withCredentials: true }).subscribe({
      next: (res) => {
        this.planosPorPet = {};
        (res?.planos || []).forEach((p: any) => this.planosPorPet[p.id_pet] = nomeDoPlano(p.produto?.nome));
      },
      error: (err) => console.error('Erro ao checar planos dos pets:', err)
    });
  }

  escolherPet(idPet: number): void {
    this.petEscolhidoId = idPet;
  }

  get petEscolhido(): any {
    return this.pets.find(p => p.id_pet === this.petEscolhidoId) || null;
  }

  get usuarioJaPossuiPlano(): boolean {
    return !this.petEscolhido || !!this.planosPorPet[this.petEscolhido.id_pet];
  }

  get mensagemAvisoPlano(): string {
    if (this.pets.length === 0) return 'Cadastre um pet antes de contratar um plano.';
    if (!this.petEscolhido) return 'Escolha o pet que vai receber o plano.';
    return `${this.petEscolhido.nome} já possui o ${this.planosPorPet[this.petEscolhido.id_pet]}. Cancele-o em Meu Plano antes de assinar outro.`;
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
              ? p.beneficios.split(/[\n;]+/).map((b: string) => b.trim()).filter((b: string) => b.length > 0)
              : [];

            return {
              id_produto: p.id_produto,
              tag: tagReal,
              nome: nomeReal,
              preco: `R$ ${formatarPreco(p.preco)}`,
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
    if (this.usuarioJaPossuiPlano) {
      alert(this.mensagemAvisoPlano);
      return;
    }
    this.planoSelecionado = plano;
  }

  fecharDetalhes(): void {
    this.planoSelecionado = null;
  }

  concluirPlano(): void {
    if (!this.planoSelecionado || this.usuarioJaPossuiPlano) return;

    localStorage.setItem(
      'planoSelecionado',
      JSON.stringify({ ...this.planoSelecionado, id_pet: this.petEscolhido.id_pet, nome_pet: this.petEscolhido.nome })
    );

    this.router.navigate(['/user/pagamento-plano']);
  }
}