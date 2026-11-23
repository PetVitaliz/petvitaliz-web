import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';

export type AcaoBanner = 'planos' | 'servicos' | 'adocao' | 'agendar';

export type Banner = {
  tema: 'azul' | 'amarelo' | 'verde' | 'claro';
  etiqueta: string;      // linha pequena de cima (ex.: "plano de saúde")
  titulo: string;        // primeira linha do título
  destaque: string;      // segunda linha, em outra cor
  checks: string[];      // etiquetas com ✓
  nota?: string;         // texto pequeno embaixo
  botao: string;
  acao: AcaoBanner;
  imagem: string;
  // Para fotos com o lado esquerdo cortado: some suavemente nesse lado
  suavizarEsquerda?: boolean;
  // Move o círculo para o lado (px) quando o pet não fica no meio da foto
  ajusteCirculo?: number;
  // Foto com corte reto na direita: encosta na borda direita e fica maior que o círculo
  encostarDireita?: boolean;
};

@Component({
  selector: 'app-banner-carrossel',
  standalone: true,
  templateUrl: './banner-carrossel.component.html',
  styleUrl: './banner-carrossel.component.css'
})
export class BannerCarrosselComponent implements OnInit, OnDestroy {

  @Output() acao = new EventEmitter<AcaoBanner>();

  // Para adicionar um banner, é só incluir mais um item aqui
  banners: Banner[] = [
    {
      tema: 'azul',
      etiqueta: 'plano de saúde',
      titulo: 'Check-up completo',
      destaque: 'todo mês',
      checks: ['Consultas e vacinas', 'Teleorientação'],
      nota: 'Consulte as condições de cada plano.',
      botao: 'Conhecer os planos',
      acao: 'planos',
      imagem: 'assets/img/banners/banner-dupla-sentados.webp'
    },
    {
      tema: 'amarelo',
      etiqueta: 'adoção',
      titulo: 'Adote um amigo',
      destaque: 'eles esperam por você',
      checks: ['Conheça cada pet', 'Visite a clínica'],
      botao: 'Conhecer os pets',
      acao: 'adocao',
      imagem: 'assets/img/banners/banner-cachorro.webp'
    },
    {
      tema: 'verde',
      etiqueta: 'clínica veterinária',
      titulo: 'Cuidado e apoio',
      destaque: 'para os seus pets',
      checks: ['Consultas veterinárias', 'Vacinação'],
      botao: 'Agendar consulta',
      acao: 'agendar',
      imagem: 'assets/img/banners/banner-dupla.webp'
    },
    {
      tema: 'claro',
      etiqueta: 'banho e tosa',
      titulo: 'Seu pet cheiroso',
      destaque: 'a partir de R$ 40',
      checks: ['Banho e secagem', 'Corte de unhas'],
      nota: 'Valor para porte pequeno (até 9 kg).',
      botao: 'Ver serviços',
      acao: 'servicos',
      imagem: 'assets/img/banners/banner-gatos-laranja.webp'
    }
  ];

  atual = 0;
  arrastando = false;
  deslocamento = 0; // px enquanto arrasta com o dedo/mouse

  private timer?: ReturnType<typeof setInterval>;
  private acabouDeArrastar = false;
  private pausado = false;
  private inicioX = 0;
  private larguraSlide = 1;
  private readonly intervalo = 6000;

  ngOnInit(): void {
    const reduzir = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!reduzir) {
      this.timer = setInterval(() => {
        if (!this.pausado && !this.arrastando) {
          this.proximo();
        }
      }, this.intervalo);
    }
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }

  // Clique num banner vizinho leva até ele (ignorado logo depois de arrastar)
  clicarSlide(i: number): void {
    if (this.acabouDeArrastar) {
      return;
    }
    this.irPara(i);
  }

  irPara(i: number): void {
    const total = this.banners.length;
    this.atual = (i + total) % total;
  }

  proximo(): void {
    this.irPara(this.atual + 1);
  }

  anterior(): void {
    this.irPara(this.atual - 1);
  }

  pausar(valor: boolean): void {
    this.pausado = valor;
  }

  clicar(b: Banner, i: number): void {
    if (this.acabouDeArrastar) {
      return;
    }
    if (i !== this.atual) {
      this.irPara(i);
      return;
    }
    this.acao.emit(b.acao);
  }

  // ---------- Arrastar (celular e mouse) ----------

  comecarArraste(e: PointerEvent, trilho: HTMLElement): void {
    if (e.pointerType === 'mouse' && e.button !== 0) {
      return;
    }
    this.arrastando = true;
    this.inicioX = e.clientX;
    this.deslocamento = 0;
    const slide = trilho.querySelector('.slide') as HTMLElement | null;
    this.larguraSlide = slide?.offsetWidth || trilho.offsetWidth;
  }

  moverArraste(e: PointerEvent): void {
    if (this.arrastando) {
      this.deslocamento = e.clientX - this.inicioX;
    }
  }

  terminarArraste(): void {
    if (!this.arrastando) {
      return;
    }
    const limite = Math.min(80, this.larguraSlide * 0.15);
    this.acabouDeArrastar = Math.abs(this.deslocamento) > 6;
    setTimeout(() => (this.acabouDeArrastar = false), 0);
    if (this.deslocamento < -limite) {
      this.proximo();
    } else if (this.deslocamento > limite) {
      this.anterior();
    }
    this.arrastando = false;
    this.deslocamento = 0;
  }
}
