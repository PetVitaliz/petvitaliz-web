import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

export type ServicoPetVitaliz = {
  titulo: string;
  subtitulo: string;
  descricao: string;
  extra?: string;
  botao: string;
  imagem: string;
};

@Component({
  selector: 'app-servicos-home',
  standalone: true,
  templateUrl: './servicos-home.component.html',
  styleUrl: './servicos-home.component.css'
})
export class ServicosHomeComponent {

  // Planos vindos da home: usados para mostrar a economia e o menor preço no banner
  @Input() planos: any[] = [];

  @Output() agendar = new EventEmitter<void>();
  @Output() verPlanos = new EventEmitter<boolean>(); // true = abrir já no ciclo anual
  @Output() saibaMais = new EventEmitter<ServicoPetVitaliz>();

  @ViewChild('trilho') trilho?: ElementRef<HTMLElement>;

  // Todos os serviços da PetVitaliz. Para incluir um novo, é só adicionar aqui.
  servicos: ServicoPetVitaliz[] = [
    {
      titulo: 'Consultas',
      subtitulo: 'Check-ups e retornos',
      descricao: 'Avaliação completa com veterinários dedicados, do check-up de rotina ao acompanhamento de tratamentos.',
      extra: 'Incluso nos planos a partir do Bronze.',
      botao: 'Agendar consulta',
      imagem: 'assets/img/servicos/consultas.svg'
    },
    {
      titulo: 'Vacinação',
      subtitulo: 'Carteirinha sempre em dia',
      descricao: 'Vacinas e vermifugação no tempo certo, com histórico digital e lembretes para você não esquecer.',
      extra: 'Vacinas anuais inclusas a partir do Prata.',
      botao: 'Agendar vacina',
      imagem: 'assets/img/servicos/vacinacao.svg'
    },
    {
      titulo: 'Exames',
      subtitulo: 'Diagnóstico rápido e preciso',
      descricao: 'Exames de rotina e laboratoriais com tecnologia atual, para cuidar da saúde do seu pet antes que algo apareça.',
      extra: 'Exames de rotina inclusos no Ouro e no Diamante.',
      botao: 'Agendar exame',
      imagem: 'assets/img/servicos/exames.svg'
    },
    {
      titulo: 'Atendimento 24h',
      subtitulo: 'Emergência a qualquer hora',
      descricao: 'Equipe pronta para atender o seu pet dia e noite, inclusive aos fins de semana.',
      extra: 'Incluso em todos os planos.',
      botao: 'Falar com a clínica',
      imagem: 'assets/img/servicos/emergencia.svg'
    },
    {
      titulo: 'Banho',
      subtitulo: 'Limpo, cheiroso e feliz',
      descricao: 'Banho e secagem com produtos adequados para cada tipo de pelo, em um ambiente calmo e seguro.',
      extra: 'A partir de R$ 40 (porte pequeno).',
      botao: 'Agendar banho',
      imagem: 'assets/img/servicos/banho.svg'
    },
    {
      titulo: 'Tosa e estética',
      subtitulo: 'Unhas, ouvidos e pelagem',
      descricao: 'Tosa na tesoura, escovação, corte de unhas e limpeza de ouvido para o seu pet ficar bonito e confortável.',
      extra: 'Banho e tosa inclusos em todos os planos.',
      botao: 'Agendar tosa',
      imagem: 'assets/img/servicos/tosa.svg'
    },
    {
      titulo: 'Hospedagem e creche',
      subtitulo: 'Diversão o dia todo',
      descricao: 'Vai viajar ou passar o dia fora? Seu pet brinca, socializa e é cuidado com carinho até você voltar.',
      botao: 'Agendar hospedagem',
      imagem: 'assets/img/servicos/hospedagem.svg'
    },
    {
      titulo: 'Leva & Traz Pet',
      subtitulo: 'Buscamos e levamos',
      descricao: 'Sem tempo para ir até a clínica? A gente busca o seu pet em casa e leva de volta depois do atendimento.',
      extra: 'Incluso no Ouro (2x/mês) e no Diamante (ilimitado).',
      botao: 'Agendar Leva & Traz',
      imagem: 'assets/img/servicos/leva-traz.svg'
    },
    {
      titulo: 'Teleorientação',
      subtitulo: 'Atendimento sem sair de casa',
      descricao: 'Tire dúvidas e receba orientações de saúde por vídeo com a nossa equipe veterinária.',
      botao: 'Agendar teleorientação',
      imagem: 'assets/img/servicos/teleorientacao.svg'
    },
    {
      titulo: 'Acessórios e brinquedos',
      subtitulo: 'Tudo para o dia a dia',
      descricao: 'Brinquedos, caminhas e acessórios escolhidos pela nossa equipe para o conforto e a diversão do seu pet.',
      botao: 'Falar com a clínica',
      imagem: 'assets/img/servicos/acessorios.svg'
    }
  ];

  // ---------- Banner de assinatura ----------

  get maiorEconomia(): number {
    const valores = this.planos
      .filter((p) => p.mensal > 0 && p.anual < p.mensal)
      .map((p) => Math.round((1 - p.anual / p.mensal) * 100));
    return valores.length ? Math.max(...valores) : 0;
  }

  get menorAnual(): string {
    const valores = this.planos.map((p) => p.anual).filter((v) => v > 0);
    if (!valores.length) {
      return '';
    }
    const [reais, centavos] = Math.min(...valores).toFixed(2).split('.');
    return `${reais},${centavos}`;
  }

  get menorAnualReais(): string {
    return this.menorAnual.split(',')[0];
  }

  get menorAnualCentavos(): string {
    return this.menorAnual.split(',')[1] ?? '';
  }

  // ---------- Carrossel ----------

  rolar(direcao: number): void {
    const el = this.trilho?.nativeElement;
    if (!el) {
      return;
    }
    const card = el.querySelector('.servico') as HTMLElement | null;
    const passo = (card?.offsetWidth || 300) + 20;
    const noFim = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    const noComeco = el.scrollLeft <= 4;

    // volta ao começo/fim em vez de travar
    if (direcao > 0 && noFim) {
      el.scrollTo({ left: 0, behavior: 'smooth' });
    } else if (direcao < 0 && noComeco) {
      el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' });
    } else {
      el.scrollBy({ left: direcao * passo, behavior: 'smooth' });
    }
  }
}
