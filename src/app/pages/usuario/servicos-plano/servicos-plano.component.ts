import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { IconePetComponent } from '../../../components/icone-pet/icone-pet.component';
import { lerPlanosDoCliente } from '../../../core/utils/planos-resposta';
import {
  PLAN_NAMES, PLAN_ORDER, PlanId, Quota, SERVICES, ServiceInfo,
  getMinimumPlan, getPlanId, getServiceQuota
} from '../../../core/plan-coverage';

interface PetServicos {
  id_pet: number;
  nome: string;
  especie: string;
  foto_url: string | null;
  planId: PlanId | null;
}

const FOTOS: Record<string, string> = {
  vacinacao: 'assets/img/servicos/fotos/vacinacao.jpg',
  exames: 'assets/img/servicos/fotos/exames.jpg',
  banho_tosa: 'assets/img/servicos/fotos/banho-tosa.jpg',
  emergencia: 'assets/img/servicos/fotos/emergencia.jpg',
  leva_busca: 'assets/img/servicos/fotos/leva-busca.jpg'
};

// Ordem igual à do app: consulta primeiro, depois os serviços com foto
const ORDEM = ['consulta', 'vacinacao', 'exames', 'banho_tosa', 'emergencia', 'leva_busca'];

// Página "Serviços" da área logada, inspirada na tela de serviços do mobile
@Component({
  selector: 'app-servicos-plano',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, IconePetComponent],
  templateUrl: './servicos-plano.component.html',
  styleUrl: './servicos-plano.component.css'
})
export class ServicosPlanoComponent implements OnInit {

  carregando = true;
  pets: PetServicos[] = [];
  petId: number | null = null;
  busca = '';
  bloqueado: ServiceInfo | null = null;

  readonly fotos = FOTOS;
  readonly nomesPlano = PLAN_NAMES;
  private readonly servicos = [...SERVICES].sort((a, b) => ORDEM.indexOf(a.id) - ORDEM.indexOf(b.id));

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    const opcoes = { withCredentials: true };
    forkJoin({
      pets: this.http.get<any>(`${environment.apiUrl}/user/listar/pet`, opcoes).pipe(catchError((e) => of({ erro: e }))),
      planos: this.http.get<any>(`${environment.apiUrl}/user/planos`, opcoes).pipe(catchError(() => of(null)))
    }).subscribe(({ pets, planos }: any) => {
      this.carregando = false;
      if (pets?.erro && (pets.erro.status === 401 || pets.erro.status === 403)) {
        this.router.navigate(['/login']);
        return;
      }
      const doCliente = lerPlanosDoCliente(planos);
      this.pets = (pets?.pets || pets?.Pets || []).map((p: any) => {
        const contratado = doCliente.find((x) => Number(x.id_pet) === Number(p.id_pet));
        return {
          id_pet: p.id_pet,
          nome: p.nome,
          especie: p.especie,
          foto_url: p.foto_url || null,
          planId: contratado ? getPlanId(contratado.produto?.nome) : null
        };
      });
      this.petId = (this.pets.find((p) => p.planId) || this.pets[0])?.id_pet ?? null;
    });
  }

  get pet(): PetServicos | null {
    return this.pets.find((p) => p.id_pet === this.petId) || null;
  }

  get lista(): ServiceInfo[] {
    const termo = this.busca.trim().toLowerCase();
    return termo
      ? this.servicos.filter((s) => s.nome.toLowerCase().includes(termo) || s.descricao.toLowerCase().includes(termo))
      : this.servicos;
  }

  cota(s: ServiceInfo): Quota | null {
    return getServiceQuota(this.pet?.planId ?? null, s.id);
  }

  textoCota(q: Quota): string {
    return q === 'ilimitado' ? 'Ilimitado' : `${q}x por mês`;
  }

  planoMinimo(s: ServiceInfo): string {
    const id = getMinimumPlan(s.id);
    return id ? PLAN_NAMES[id] : '';
  }

  // Serviços que o plano atual não cobre e o plano que libera todos eles
  get faltando(): { nomes: string; plano: string } | null {
    const pet = this.pet;
    if (!pet?.planId) return null;
    const fora = this.servicos.filter((s) => this.cota(s) === null);
    if (!fora.length) return null;
    const minimo = fora
      .map((s) => getMinimumPlan(s.id))
      .filter((p): p is PlanId => !!p)
      .sort((a, b) => PLAN_ORDER.indexOf(b) - PLAN_ORDER.indexOf(a))[0];
    if (!minimo) return null;
    const nomes = fora.map((s) => s.nome.toLowerCase());
    const texto = nomes.length > 1 ? `${nomes.slice(0, -1).join(', ')} e ${nomes[nomes.length - 1]}` : nomes[0];
    return { nomes: texto.charAt(0).toUpperCase() + texto.slice(1), plano: PLAN_NAMES[minimo] };
  }

  abrir(s: ServiceInfo): void {
    const pet = this.pet;
    if (!pet) return;
    if (this.cota(s) === null) {
      this.bloqueado = s;
      return;
    }
    this.router.navigate(['/user/agendamento'], { queryParams: { pet: pet.id_pet, servico: s.id } });
  }

  irParaPlanos(): void {
    this.bloqueado = null;
    this.router.navigate(['/user/meu-plano'], { queryParams: { pet: this.pet?.id_pet } });
  }
}
