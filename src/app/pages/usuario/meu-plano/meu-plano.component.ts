import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { PlanoMontado, montarPlano, moeda } from '../../../core/utils/montar-plano';
import { lerPlanosDoCliente } from '../../../core/utils/planos-resposta';
import { Assinatura, desfazerCancelamento, diasRestantes, fimDoPeriodo, garantirAssinatura, lerAssinatura, processarCancelamentosVencidos, textoDias } from '../../../core/utils/assinaturas';
import { PLAN_NAMES, PlanId, Quota, SERVICES, ServiceId, getPlanId, getServiceQuota, servicoDaConsulta } from '../../../core/plan-coverage';
import { PlanosCarrosselComponent } from '../../../components/planos-carrossel/planos-carrossel.component';
import { IconePetComponent } from '../../../components/icone-pet/icone-pet.component';
import { GerenciarPlanoComponent } from '../../../components/gerenciar-plano/gerenciar-plano.component';

interface PetComPlano {
  id_pet: number;
  nome: string;
  especie: string;
  foto_url: string | null;
  plano: PlanoMontado | null;
  planId: PlanId | null;
}

interface UsoServico {
  id: ServiceId;
  nome: string;
  cota: Quota;
  usados: number;
}

// "Meu plano" igual ao app: pets, plano do pet, uso do mês, mudar e gerenciar
@Component({
  selector: 'app-meu-plano',
  standalone: true,
  imports: [CommonModule, RouterModule, PlanosCarrosselComponent, IconePetComponent, GerenciarPlanoComponent],
  templateUrl: './meu-plano.component.html',
  styleUrl: './meu-plano.component.css'
})
export class MeuPlanoComponent implements OnInit {

  carregando = true;
  erro = '';
  sucesso = '';

  pets: PetComPlano[] = [];
  semPet: { id_pet: number; plano: PlanoMontado }[] = [];
  disponiveis: PlanoMontado[] = [];
  private consultas: any[] = [];

  petId: number | null = null;
  ciclo: 'mensal' | 'anual' = 'mensal';
  janela: 'gerenciar' | 'mudar' | null = null;
  removendo: number | null = null;

  readonly moeda = moeda;

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Planos cancelados cujo período pago acabou saem do servidor antes de mostrar a página
    processarCancelamentosVencidos(this.http, environment.apiUrl, () => this.carregar());
    this.carregar();
  }

  carregar(): void {
    const opcoes = { withCredentials: true };
    forkJoin({
      planos: this.http.get<any>(`${environment.apiUrl}/user/planos`, opcoes).pipe(catchError((e) => of({ erro: e }))),
      pets: this.http.get<any>(`${environment.apiUrl}/user/listar/pet`, opcoes).pipe(catchError(() => of(null))),
      produtos: this.http.get<any>(`${environment.apiUrl}/adm/listar/produtos`, opcoes).pipe(catchError(() => of(null))),
      consultas: this.http.get<any>(`${environment.apiUrl}/consultas`, opcoes).pipe(catchError(() => of(null)))
    }).subscribe(({ planos, pets, produtos, consultas }: any) => {
      this.carregando = false;

      this.disponiveis = (produtos?.produtos || [])
        .map((p: any) => montarPlano(p))
        .sort((a: PlanoMontado, b: PlanoMontado) => a.mensal - b.mensal);

      if (planos?.erro && (planos.erro.status === 401 || planos.erro.status === 403)) {
        this.router.navigate(['/login']);
        return;
      }

      const listaPets: any[] = pets?.pets || pets?.Pets || [];
      const doCliente = lerPlanosDoCliente(planos);
      this.consultas = consultas?.consultas || [];

      this.pets = listaPets.map((p) => {
        const contratado = doCliente.find((x) => Number(x.id_pet) === Number(p.id_pet));
        const plano = contratado ? montarPlano(contratado.produto || {}) : null;
        return {
          id_pet: p.id_pet,
          nome: p.nome,
          especie: p.especie,
          foto_url: p.foto_url || null,
          plano,
          planId: plano ? getPlanId(plano.nome) : null
        };
      });

      // Todo plano ativo tem um registro de período (renovação e dias restantes)
      this.pets.forEach((p) => { if (p.plano) garantirAssinatura(p.id_pet, { id_produto: p.plano.id_produto, nome: p.plano.nome }); });

      // Planos ligados a pets que já foram excluídos
      this.semPet = pets
        ? doCliente.filter((x) => !listaPets.some((p) => Number(p.id_pet) === Number(x.id_pet)))
            .map((x) => ({ id_pet: x.id_pet, plano: montarPlano(x.produto || {}) }))
        : [];

      // Pet escolhido: o que acabou de contratar (?ativado=id), o da URL (?pet=id) ou o primeiro com plano
      const q = this.route.snapshot.queryParamMap;
      const ativado = Number(q.get('ativado')) || null;
      const daUrl = Number(q.get('pet')) || null;
      const escolhido = this.pets.find((p) => p.id_pet === ativado) || this.pets.find((p) => p.id_pet === daUrl)
        || this.pets.find((p) => p.plano) || this.pets[0];
      this.petId = escolhido?.id_pet ?? null;

      if (ativado && escolhido?.plano) {
        this.sucesso = `Pagamento confirmado! O ${escolhido.plano.nome} de ${escolhido.nome} já está ativo.`;
      }
    });
  }

  get pet(): PetComPlano | null {
    return this.pets.find((p) => p.id_pet === this.petId) || null;
  }

  get assinatura(): Assinatura | null {
    return this.pet ? lerAssinatura(this.pet.id_pet) : null;
  }

  get renovaEm(): string {
    const a = this.assinatura;
    return a ? fimDoPeriodo(a).toLocaleDateString('pt-BR') : '';
  }

  get diasFaltam(): number {
    const a = this.assinatura;
    return a ? diasRestantes(a) : 0;
  }

  get textoFaltam(): string {
    return this.assinatura ? textoDias(this.diasFaltam) : '';
  }

  // Porcentagem do período que já passou (barra do cartão)
  get progresso(): number {
    const a = this.assinatura;
    if (!a) return 0;
    const total = a.ciclo === 'anual' ? 365 : 30;
    return Math.min(100, Math.max(0, Math.round(((total - this.diasFaltam) / total) * 100)));
  }

  get cancelado(): boolean {
    return !!this.assinatura?.cancelamento;
  }

  get petSeraExcluido(): boolean {
    return !!this.assinatura?.cancelamento?.excluirPet;
  }

  manterPlano(): void {
    const pet = this.pet;
    if (!pet?.plano) return;
    desfazerCancelamento(pet.id_pet);
    this.sucesso = `O ${pet.plano.nome} de ${pet.nome} vai continuar renovando normalmente.`;
  }

  get textoCobranca(): string {
    const a = this.assinatura;
    if (!a || !this.pet?.plano) return '';
    const metodo = a.metodo === 'pix' ? 'no Pix' : a.metodo === 'boleto' ? 'no boleto' : `no cartão${a.cartaoFinal ? ' final ' + a.cartaoFinal : ''}`;
    return a.ciclo === 'anual'
      ? `Plano anual · ${moeda(this.pet.plano.anual * 12)} cobrado ${metodo}`
      : `Plano mensal · cobrado ${metodo}`;
  }

  get precoMes(): number {
    const p = this.pet?.plano;
    if (!p) return 0;
    return this.assinatura?.ciclo === 'anual' ? p.anual : p.mensal;
  }

  get trocaAgendada(): string {
    return (this.assinatura as any)?.trocaAgendada?.nome || '';
  }

  // ---------- Uso do mês (cotas) ----------

  get uso(): UsoServico[] {
    const pet = this.pet;
    if (!pet?.planId) return [];
    const hoje = new Date();
    const mes = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
    return SERVICES
      .map((s) => ({ s, cota: getServiceQuota(pet.planId, s.id) }))
      .filter((x) => x.cota !== null)
      .map(({ s, cota }) => ({
        id: s.id,
        nome: s.nome,
        cota: cota as Quota,
        usados: this.consultas.filter((c) => {
          const doPet = Number(c.id_pet ?? c.pet?.id_pet) === pet.id_pet
            || String(c.pet?.nome || '').toLowerCase() === pet.nome.toLowerCase();
          const status = String(c.status || '').toLowerCase();
          return doPet && !status.includes('cancel') && String(c.data_consulta || '').startsWith(mes) && servicoDaConsulta(c) === s.id;
        }).length
      }));
  }

  porcentagem(u: UsoServico): number {
    return u.cota === 'ilimitado' ? 0 : Math.min(100, Math.round((u.usados / u.cota) * 100));
  }

  get consultaEsgotada(): boolean {
    const c = this.uso.find((u) => u.id === 'consulta');
    return !!c && c.cota !== 'ilimitado' && c.usados >= c.cota;
  }

  // ---------- Ações ----------

  escolherPlano(p: PlanoMontado): void {
    this.router.navigate(['/user/contratar-plano'], {
      queryParams: { plano: p.id_produto, ciclo: this.ciclo, pet: this.pet && !this.pet.plano ? this.pet.id_pet : undefined }
    });
  }

  aposAlterar(mensagem: string): void {
    this.janela = null;
    this.sucesso = mensagem;
    this.erro = '';
    this.carregar();
  }

  removerPlanoSemPet(x: { id_pet: number; plano: PlanoMontado }): void {
    if (this.removendo !== null || !confirm(`Remover o ${x.plano.nome}? O pet deste plano já foi excluído.`)) return;
    if (!Number.isFinite(x.id_pet)) {
      this.erro = 'O servidor não informou a qual pet este plano pertence, então não dá para removê-lo por aqui.';
      return;
    }
    this.removendo = x.id_pet;
    this.http.delete(`${environment.apiUrl}/user/planos/cancelar/${x.id_pet}`, { withCredentials: true }).subscribe({
      next: () => { this.removendo = null; this.semPet = this.semPet.filter((s) => s.id_pet !== x.id_pet); },
      error: (err) => { this.removendo = null; this.erro = `Não foi possível remover o plano (pet nº ${x.id_pet}): ${err.error?.mensagem || err.status}`; }
    });
  }

  nomeCurtoPlano(id: PlanId | null): string {
    return id ? PLAN_NAMES[id].replace('Plano ', '') : '';
  }
}
