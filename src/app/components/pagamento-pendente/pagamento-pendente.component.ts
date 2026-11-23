import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { moeda } from '../../core/utils/montar-plano';

// Tela de Pix / boleto: mostra o código, espera alguns segundos,
// mostra "processando" e avisa que foi pago (modo de teste, igual ao app)
@Component({
  selector: 'app-pagamento-pendente',
  standalone: true,
  templateUrl: './pagamento-pendente.component.html',
  styleUrl: './pagamento-pendente.component.css'
})
export class PagamentoPendenteComponent implements OnInit, OnDestroy {
  @Input() metodo: 'pix' | 'boleto' = 'pix';
  @Input() valor = 0;
  @Input() descricao = '';
  @Output() confirmado = new EventEmitter<void>();

  fase: 'aguardando' | 'processando' = 'aguardando';
  codigo = '';
  modulos: { x: number; y: number }[] = [];
  readonly tamanho = 29;
  copiado = false;
  restante = 30 * 60;

  readonly moeda = moeda;
  private timers: ReturnType<typeof setTimeout>[] = [];
  private relogio?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    const id = Math.random().toString(36).slice(2, 10).toUpperCase();
    if (this.metodo === 'pix') {
      this.codigo = `00020126PIXDEMO-PETVITALIZ-${id}5204000053039865406${this.valor.toFixed(2)}5802BR5910PETVITALIZ6009SAOPAULO62070503***`;
      this.montarQr(this.codigo);
    } else {
      const n = () => String(Math.floor(Math.random() * 1e5)).padStart(5, '0');
      this.codigo = `00190.${n()} ${n()}.${n()}1 ${n()}.${n()}1 9 ${String(Math.round(this.valor * 100)).padStart(14, '0')}`;
    }

    this.relogio = setInterval(() => (this.restante = Math.max(0, this.restante - 1)), 1000);

    // Modo de teste: depois de alguns segundos o pagamento "cai"
    this.timers.push(setTimeout(() => (this.fase = 'processando'), 7000));
    this.timers.push(setTimeout(() => this.confirmado.emit(), 9500));
  }

  ngOnDestroy(): void {
    this.timers.forEach(clearTimeout);
    clearInterval(this.relogio);
  }

  get prazo(): string {
    const m = Math.floor(this.restante / 60), s = this.restante % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  async copiar(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.codigo);
      this.copiado = true;
      this.timers.push(setTimeout(() => (this.copiado = false), 2000));
    } catch { /* navegador sem permissão para copiar */ }
  }

  // QR Code ilustrativo (demonstração): cantos de leitura + módulos gerados a partir do código
  private montarQr(texto: string): void {
    const n = this.tamanho;
    const grade: boolean[][] = Array.from({ length: n }, () => Array(n).fill(false));
    let semente = 0;
    for (const ch of texto) semente = (semente * 31 + ch.charCodeAt(0)) >>> 0;
    const aleatorio = () => ((semente = (semente * 1103515245 + 12345) >>> 0) / 4294967296);

    const reservado = (x: number, y: number) =>
      (x < 8 && y < 8) || (x >= n - 8 && y < 8) || (x < 8 && y >= n - 8);

    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        if (!reservado(x, y)) grade[y][x] = aleatorio() > 0.52;
      }
    }

    const canto = (cx: number, cy: number) => {
      for (let y = 0; y < 7; y++) {
        for (let x = 0; x < 7; x++) {
          const borda = x === 0 || y === 0 || x === 6 || y === 6;
          const miolo = x >= 2 && x <= 4 && y >= 2 && y <= 4;
          grade[cy + y][cx + x] = borda || miolo;
        }
      }
    };
    canto(0, 0);
    canto(n - 7, 0);
    canto(0, n - 7);

    this.modulos = [];
    grade.forEach((linha, y) => linha.forEach((on, x) => on && this.modulos.push({ x, y })));
  }
}
