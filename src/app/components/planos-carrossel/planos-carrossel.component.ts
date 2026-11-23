import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlanoMontado, economiaAnual, moeda } from '../../core/utils/montar-plano';

// Carrossel de planos (mesmo visual da home): o do centro fica maior
@Component({
  selector: 'app-planos-carrossel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './planos-carrossel.component.html',
  styleUrl: './planos-carrossel.component.css'
})
export class PlanosCarrosselComponent implements OnInit, OnChanges, OnDestroy {
  @Input() planos: PlanoMontado[] = [];
  @Input() ciclo: 'mensal' | 'anual' = 'mensal';
  @Input() textoBotao = 'Contratar';
  @Output() cicloChange = new EventEmitter<'mensal' | 'anual'>();
  @Output() escolher = new EventEmitter<PlanoMontado>();

  planoAtual = 0;
  planosLoop: (PlanoMontado & { chave: number })[] = [];
  posPlano = 0;
  semAnimacao = false;
  inicioToque = 0;

  private timerAjuste?: ReturnType<typeof setTimeout>;
  private timerPlanos?: ReturnType<typeof setInterval>;
  private pausado = false;

  readonly moeda = moeda;
  readonly economia = economiaAnual;

  ngOnInit(): void {
    const reduzir = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!reduzir) {
      this.timerPlanos = setInterval(() => {
        if (!this.pausado && this.planos.length > 1) this.proximo();
      }, 5000);
    }
  }

  ngOnChanges(mudou: SimpleChanges): void {
    if (!mudou['planos']) return;
    const n = this.planos.length;
    const destaque = this.planos.findIndex((p) => p.nivel === 'ouro');
    this.planoAtual = destaque >= 0 ? destaque : 0;
    this.planosLoop = [...this.planos, ...this.planos, ...this.planos].map((p, k) => ({ ...p, chave: k }));
    this.posPlano = n + this.planoAtual;
  }

  ngOnDestroy(): void {
    clearInterval(this.timerPlanos);
    clearTimeout(this.timerAjuste);
  }

  mudarCiclo(c: 'mensal' | 'anual'): void {
    this.ciclo = c;
    this.cicloChange.emit(c);
  }

  pausar(v: boolean): void {
    this.pausado = v;
  }

  // Vai para uma posição da lista repetida e depois volta, sem animação, para a cópia do meio
  irParaPosicao(k: number): void {
    const n = this.planos.length;
    if (!n) return;
    this.posPlano = k;
    this.planoAtual = ((k % n) + n) % n;
    clearTimeout(this.timerAjuste);
    this.timerAjuste = setTimeout(() => {
      if (this.posPlano < n || this.posPlano >= 2 * n) {
        this.semAnimacao = true;
        this.posPlano = n + this.planoAtual;
        setTimeout(() => (this.semAnimacao = false), 50);
      }
    }, 480);
  }

  irParaPlano(i: number): void {
    const n = this.planos.length;
    let dif = i - this.planoAtual;
    if (dif > n / 2) dif -= n;
    if (dif < -n / 2) dif += n;
    this.irParaPosicao(this.posPlano + dif);
  }

  anterior(): void { this.irParaPosicao(this.posPlano - 1); }
  proximo(): void { this.irParaPosicao(this.posPlano + 1); }

  soltarToque(x: number): void {
    const dx = x - this.inicioToque;
    if (dx < -50) this.proximo();
    else if (dx > 50) this.anterior();
  }

  clicarBotao(k: number, p: PlanoMontado): void {
    if (k === this.posPlano) this.escolher.emit(p);
    else this.irParaPosicao(k);
  }
}
