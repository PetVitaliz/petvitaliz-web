import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { PlanoMontado, economiaAnual, montarPlano, moeda } from '../../../core/utils/montar-plano';
import { IconePetComponent } from '../../../components/icone-pet/icone-pet.component';
import { PagamentoPendenteComponent } from '../../../components/pagamento-pendente/pagamento-pendente.component';

type Etapa = 'detalhes' | 'pagamento' | 'aguardando' | 'processando' | 'sucesso';
type Metodo = 'cartao' | 'pix' | 'boleto';

// Mesmas regras do app: até 4x sem juros no anual; acima disso, 1,99% ao mês
const JUROS = 0.0199;
const PARCELAS_SEM_JUROS = 4;

@Component({
  selector: 'app-contratar-plano',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IconePetComponent, PagamentoPendenteComponent],
  templateUrl: './contratar-plano.component.html',
  styleUrl: './contratar-plano.component.css'
})
export class ContratarPlanoComponent implements OnInit, OnDestroy {

  etapa: Etapa = 'detalhes';
  readonly nomesEtapas: Record<string, string> = { detalhes: 'Detalhes do plano', pagamento: 'Pagamento' };
  carregando = true;
  erro = '';

  plano: PlanoMontado | null = null;
  pets: any[] = [];
  petsComPlano: Record<number, string> = {};
  petId: number | null = null;
  ciclo: 'mensal' | 'anual' = 'mensal';
  aceitouTermos = false;

  metodo: Metodo = 'cartao';
  parcelas = 1;
  readonly opcoesParcelas = Array.from({ length: 12 }, (_, i) => i + 1);
  cartao = { numero: '', nome: '', validade: '', cvv: '' };
  salvarCartao = true;
  erroPagamento = '';

  readonly moeda = moeda;
  readonly economia = economiaAnual;
  private timer?: ReturnType<typeof setTimeout>;

  constructor(private http: HttpClient, private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    const q = this.route.snapshot.queryParamMap;
    const idPlano = Number(q.get('plano'));
    const petUrl = Number(q.get('pet')) || null;
    this.ciclo = q.get('ciclo') === 'anual' ? 'anual' : 'mensal';

    const opcoes = { withCredentials: true };
    forkJoin({
      produtos: this.http.get<any>(`${environment.apiUrl}/adm/listar/produtos`, opcoes).pipe(catchError(() => of(null))),
      pets: this.http.get<any>(`${environment.apiUrl}/user/listar/pet`, opcoes).pipe(catchError(() => of(null))),
      planos: this.http.get<any>(`${environment.apiUrl}/user/planos`, opcoes).pipe(catchError(() => of(null)))
    }).subscribe(({ produtos, pets, planos }: any) => {
      this.carregando = false;
      const produto = (produtos?.produtos || []).find((p: any) => Number(p.id_produto) === idPlano);
      if (!produto) {
        this.router.navigate(['/user/meu-plano']);
        return;
      }
      this.plano = montarPlano(produto);
      this.pets = pets?.pets || pets?.Pets || [];
      (planos?.planos || []).forEach((p: any) => {
        this.petsComPlano[p.id_pet] = String(p.produto?.nome || 'um plano').split(' | ')[0];
      });

      const livres = this.pets.filter((p) => !this.petsComPlano[p.id_pet]);
      const preferido = livres.find((p) => p.id_pet === petUrl);
      this.petId = (preferido || (livres.length === 1 ? livres[0] : null))?.id_pet ?? null;
    });
  }

  ngOnDestroy(): void {
    clearTimeout(this.timer);
  }

  // ---------- Detalhes ----------

  get pet(): any {
    return this.pets.find((p) => p.id_pet === this.petId) || null;
  }

  escolherPet(p: any): void {
    if (this.petsComPlano[p.id_pet]) return;
    this.petId = p.id_pet;
    this.erro = '';
  }

  precoMes(c: 'mensal' | 'anual'): number {
    return this.plano ? (c === 'anual' ? this.plano.anual : this.plano.mensal) : 0;
  }

  // Mensal: 1 mês. Anual: os 12 meses cobrados de uma vez
  get total(): number {
    return this.ciclo === 'anual' ? this.precoMes('anual') * 12 : this.precoMes('mensal');
  }

  continuarParaPagamento(): void {
    if (!this.pet) { this.erro = 'Escolha o pet que vai receber o plano.'; return; }
    if (!this.aceitouTermos) { this.erro = 'Aceite os termos para continuar.'; return; }
    this.erro = '';
    if (this.ciclo === 'mensal') this.parcelas = 1;
    this.etapa = 'pagamento';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  voltar(): void {
    this.erroPagamento = '';
    this.etapa = 'detalhes';
  }

  // ---------- Parcelas ----------

  get podeParcelar(): boolean {
    return this.metodo === 'cartao' && this.ciclo === 'anual';
  }

  valorParcela(n: number): number {
    if (n <= PARCELAS_SEM_JUROS) return this.total / n;
    return this.total * (JUROS / (1 - Math.pow(1 + JUROS, -n)));
  }

  textoParcela(n: number): string {
    const juros = n > PARCELAS_SEM_JUROS ? ' (com juros)' : ' sem juros';
    return `${n}x de ${moeda(this.valorParcela(n))}${n === 1 ? '' : juros}`;
  }

  get totalFinal(): number {
    return this.podeParcelar ? this.valorParcela(this.parcelas) * this.parcelas : this.total;
  }

  // ---------- Cartão ----------

  get bandeira(): string {
    const n = this.cartao.numero.replace(/\D/g, '');
    if (/^4/.test(n)) return 'Visa';
    if (/^(5[1-5]|2[2-7])/.test(n)) return 'Mastercard';
    if (/^3[47]/.test(n)) return 'Amex';
    if (/^(636368|438935|504175|451416|636297|5067|4576|4011|506699)/.test(n)) return 'Elo';
    return '';
  }

  mascararNumero(): void {
    const n = this.cartao.numero.replace(/\D/g, '').slice(0, 16);
    this.cartao.numero = n.replace(/(\d{4})(?=\d)/g, '$1 ');
  }

  mascararValidade(): void {
    const n = this.cartao.validade.replace(/\D/g, '').slice(0, 4);
    this.cartao.validade = n.length > 2 ? `${n.slice(0, 2)}/${n.slice(2)}` : n;
  }

  mascararCvv(): void {
    this.cartao.cvv = this.cartao.cvv.replace(/\D/g, '').slice(0, 4);
  }

  private validarCartao(): string {
    const numero = this.cartao.numero.replace(/\D/g, '');
    const [mm, aa] = this.cartao.validade.split('/').map(Number);
    const fim = new Date(2000 + (aa || 0), mm || 0, 0, 23, 59);
    if (numero.length < 13) return 'Confira o número do cartão.';
    if (!this.cartao.nome.trim()) return 'Digite o nome como está no cartão.';
    if (!mm || mm > 12 || !aa || fim < new Date()) return 'Use a validade no formato MM/AA e uma data futura.';
    if (this.cartao.cvv.length < 3) return 'Digite os 3 ou 4 números do verso.';
    return '';
  }

  // Guarda só bandeira e 4 últimos números (mesmo lugar de "Formas de pagamento")
  private guardarCartao(): void {
    try {
      const usuario = JSON.parse(localStorage.getItem('usuarioLogado') || 'null');
      const chave = `cartoesPetVitaliz:${usuario?.email || 'cliente'}`;
      const lista: any[] = JSON.parse(localStorage.getItem(chave) || '[]');
      const final = this.cartao.numero.replace(/\D/g, '').slice(-4);
      if (lista.some((c) => c.final === final && c.validade === this.cartao.validade)) return;
      lista.forEach((c) => (c.principal = false));
      lista.push({
        id: String(Date.now()),
        bandeira: this.bandeira || 'Cartão',
        final,
        nome: this.cartao.nome.trim().toUpperCase(),
        validade: this.cartao.validade,
        principal: true
      });
      localStorage.setItem(chave, JSON.stringify(lista));
    } catch { /* não impede a contratação */ }
  }

  // ---------- Pagar ----------

  pagar(): void {
    this.erroPagamento = '';
    if (!this.plano || !this.pet) { this.etapa = 'detalhes'; return; }

    if (this.metodo === 'cartao') {
      const erro = this.validarCartao();
      if (erro) { this.erroPagamento = erro; return; }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Pix e boleto: mostra o QR Code / linha digitável e espera a confirmação
    if (this.metodo !== 'cartao') {
      this.etapa = 'aguardando';
      return;
    }

    this.etapa = 'processando';
    this.timer = setTimeout(() => this.ativarPlano(), 1200);
  }

  ativarPlano(): void {
    const payload = { id_produto: Number(this.plano!.id_produto), id_pet: Number(this.pet.id_pet) };
    this.http.post(`${environment.apiUrl}/user/planos/pagamento`, payload, { withCredentials: true }).subscribe({
      next: () => {
        if (this.metodo === 'cartao' && this.salvarCartao) this.guardarCartao();
        this.etapa = 'sucesso';
      },
      error: (err) => {
        this.etapa = 'pagamento';
        this.erroPagamento = err.error?.mensagem || 'Não foi possível concluir o pagamento. Tente de novo.';
      }
    });
  }

  get textoBotaoPagar(): string {
    if (this.metodo === 'pix') return 'Gerar Pix';
    if (this.metodo === 'boleto') return 'Gerar boleto';
    return `Pagar ${moeda(this.podeParcelar ? this.valorParcela(this.parcelas) : this.totalFinal)}${this.podeParcelar && this.parcelas > 1 ? ' em ' + this.parcelas + 'x' : ''}`;
  }

  get nomeMetodo(): string {
    return this.metodo === 'pix' ? 'Pix' : this.metodo === 'boleto' ? 'Boleto' : `Cartão ${this.bandeira ? this.bandeira + ' ' : ''}final ${this.cartao.numero.replace(/\D/g, '').slice(-4)}`;
  }
}
