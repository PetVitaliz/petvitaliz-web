import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { PlanoMontado, economiaAnual, montarPlano, moeda } from '../../core/utils/montar-plano';

export type MetodoPagamento = 'cartao' | 'pix' | 'boleto';

// Mesmas regras do app: até 4x sem juros no anual; acima disso, 1,99% ao mês
const JUROS = 0.0199;
const SEM_JUROS = 4;

// Etapas de plano e pagamento usadas dentro do cadastro do pet
@Component({
  selector: 'app-plano-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './plano-checkout.component.html',
  styleUrl: './plano-checkout.component.css'
})
export class PlanoCheckoutComponent implements OnInit {
  @Input() etapa: 'plano' | 'pagamento' = 'plano';
  @Input() nomePet = '';

  carregando = true;
  planos: PlanoMontado[] = [];
  plano: PlanoMontado | null = null;
  ciclo: 'mensal' | 'anual' = 'mensal';
  aceitouTermos = false;
  verInclusos = false;

  metodo: MetodoPagamento = 'cartao';
  parcelas = 1;
  readonly opcoesParcelas = Array.from({ length: 12 }, (_, i) => i + 1);
  cartao = { numero: '', nome: '', validade: '', cvv: '' };

  readonly moeda = moeda;
  readonly economia = economiaAnual;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<any>(`${environment.apiUrl}/adm/listar/produtos`, { withCredentials: true })
      .pipe(catchError(() => of(null)))
      .subscribe((r) => {
        this.planos = (r?.produtos || []).map((p: any) => montarPlano(p)).sort((a: PlanoMontado, b: PlanoMontado) => a.mensal - b.mensal);
        this.plano = this.planos.find((p) => p.nivel === 'ouro') || this.planos[0] || null;
        this.carregando = false;
      });
  }

  precoMes(p: PlanoMontado | null, c = this.ciclo): number {
    return p ? (c === 'anual' ? p.anual : p.mensal) : 0;
  }

  get total(): number {
    return this.ciclo === 'anual' ? this.precoMes(this.plano, 'anual') * 12 : this.precoMes(this.plano, 'mensal');
  }

  get podeParcelar(): boolean {
    return this.metodo === 'cartao' && this.ciclo === 'anual';
  }

  valorParcela(n: number): number {
    return n <= SEM_JUROS ? this.total / n : this.total * (JUROS / (1 - Math.pow(1 + JUROS, -n)));
  }

  textoParcela(n: number): string {
    return `${n}x de ${moeda(this.valorParcela(n))}${n === 1 ? '' : n > SEM_JUROS ? ' (com juros)' : ' sem juros'}`;
  }

  get totalFinal(): number {
    return this.podeParcelar ? this.valorParcela(this.parcelas) * this.parcelas : this.total;
  }

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

  escolherCiclo(c: 'mensal' | 'anual'): void {
    this.ciclo = c;
    if (c === 'mensal') this.parcelas = 1;
  }

  // Chamados pelo cadastro do pet antes de avançar
  validarPlano(): string {
    if (!this.plano) return 'Escolha um plano.';
    if (!this.aceitouTermos) return 'Aceite os termos para continuar.';
    return '';
  }

  validarPagamento(): string {
    if (this.metodo !== 'cartao') return '';
    const numero = this.cartao.numero.replace(/\D/g, '');
    const [mm, aa] = this.cartao.validade.split('/').map(Number);
    const fim = new Date(2000 + (aa || 0), mm || 0, 0, 23, 59);
    if (numero.length < 13) return 'Confira o número do cartão.';
    if (!this.cartao.nome.trim()) return 'Digite o nome como está no cartão.';
    if (!mm || mm > 12 || !aa || fim < new Date()) return 'Use a validade no formato MM/AA e uma data futura.';
    if (this.cartao.cvv.length < 3) return 'Digite os 3 ou 4 números do verso.';
    return '';
  }

  get nomeMetodo(): string {
    if (this.metodo === 'pix') return 'Pix';
    if (this.metodo === 'boleto') return 'Boleto';
    return `Cartão ${this.bandeira ? this.bandeira + ' ' : ''}final ${this.cartao.numero.replace(/\D/g, '').slice(-4)}`;
  }
}
