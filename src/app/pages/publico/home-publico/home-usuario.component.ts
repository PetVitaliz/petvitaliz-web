import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { CommonModule, ViewportScroller } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { formatarPreco } from '../../../core/utils/formato-plano';
import { environment } from '../../../environments/environment';
import { AuthRedirectService } from '../../../core/services/auth-redirect.service';
import { ContatoRapidoService } from '../../../core/services/contato-rapido.service';
import { AcaoBanner, BannerCarrosselComponent } from '../../../components/banner-carrossel/banner-carrossel.component';
import { ServicoPetVitaliz, ServicosHomeComponent } from '../../../components/servicos-home/servicos-home.component';

@Component({
  selector: 'app-home-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, BannerCarrosselComponent, ServicosHomeComponent],
  templateUrl: './home-usuario.component.html',
  styleUrl: './home-usuario.component.css'
})
export class HomeUsuarioComponent implements OnInit, OnDestroy {

  // ---------- Planos (vêm da API; mesmo visual da página de admin) ----------
  planos: any[] = [];
  carregandoPlanos = true;
  ciclo: 'mensal' | 'anual' = 'mensal';
  planoAtual = 0;       // plano em destaque no centro do carrossel
  inicioToque = 0;

  // Carrossel sem fim: a lista aparece 3 vezes e a posição fica sempre na cópia do meio
  planosLoop: any[] = [];
  posPlano = 0;
  semAnimacao = false;
  private timerAjuste?: ReturnType<typeof setTimeout>;
  private timerPlanos?: ReturnType<typeof setInterval>;
  private planosPausados = false;

  // Cores dos níveis (iguais às do admin)
  private readonly coresNivel: Record<string, string> = {
    bronze: '#B87333',
    prata: '#A3ADBC',
    ouro: '#E3A912',
    diamante: '#4FB3D9',
    personalizado: '#21479B'
  };

  // Proporção anual/mensal padrão de cada nível (quando o anual não vem salvo)
  private readonly fatorAnual: Record<string, number> = {
    bronze: 119.9 / 139.9,
    prata: 179.9 / 219.9,
    ouro: 349.9 / 399.9,
    diamante: 549.9 / 649.9
  };

  faixaBeneficios = [
    'Consultas com desconto',
    'Vacinação inclusa',
    'Teleorientação veterinária',
    'Carteirinha digital do pet',
    'Prioridade no agendamento'
  ];

  // ---------- Adoção (indicação da ONG Amigo não se compra) ----------
  linkAdocao = 'https://www.amigonaosecompra.com.br/quero-adotar?available=true';

  // ---------- Sobre nós ----------
  valores = [
    { icone: 'favorite', titulo: 'Compaixão', descricao: 'Cada pet é tratado com bondade, paciência e empatia.' },
    { icone: 'verified_user', titulo: 'Integridade', descricao: 'Honestidade e transparência em cada orientação e valor.' },
    { icone: 'workspace_premium', titulo: 'Excelência', descricao: 'Protocolos rigorosos e aprendizado contínuo da equipe.' },
    { icone: 'handshake', titulo: 'Colaboração', descricao: 'Tutores e veterinários juntos pelo melhor resultado.' }
  ]


  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private scroller: ViewportScroller,
    private authRedirect: AuthRedirectService,
    private contatoRapido: ContatoRapidoService
  ) {}

  ngOnInit(): void {
    this.buscarPlanosCadastrados();

    // Carrossel de planos passa sozinho a cada 5 segundos
    const reduzir = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!reduzir) {
      this.timerPlanos = setInterval(() => {
        if (!this.planosPausados && this.planos.length > 1) {
          this.proximoPlano();
        }
      }, 5000);
    }
  }

  ngOnDestroy(): void {
    clearInterval(this.timerPlanos);
    clearTimeout(this.timerAjuste);
  }

  // Para enquanto o mouse está em cima ou algo dentro tem foco
  pausarPlanos(valor: boolean): void {
    this.planosPausados = valor;
  }

  // ---------- Navegação ----------

  irParaSecao(id: string): void {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      this.scroller.scrollToAnchor(id);
    }
  }

  // Os planos carregam depois e empurram as seções de baixo;
  // se a página abriu numa seção (ex.: /#contato), rola de novo até ela
  private corrigirRolagemDaSecao(): void {
    const secao = this.route.snapshot.fragment;
    if (secao) {
      setTimeout(() => this.irParaSecao(secao), 0);
    }
  }

  // Banner de assinatura da seção de serviços
  verPlanosDoBanner(anual: boolean): void {
    if (anual) {
      this.ciclo = 'anual';
    }
    this.irParaSecao('planos');
  }

  // "Saiba mais" de um serviço: abre o contato já com o assunto e a pergunta
  saberMaisServico(s: ServicoPetVitaliz): void {
    this.contatoRapido.preencher(
      'Dúvidas sobre serviços',
      `Olá! Gostaria de saber mais sobre o serviço de ${s.titulo.toLowerCase()}.`
    );
    this.contatoRapido.abrir();
  }

  aoClicarBanner(acao: AcaoBanner): void {
    if (acao === 'agendar') {
      this.irParaAgendamento();
    } else {
      this.irParaSecao(acao);
    }
  }

  irParaAgendamento(): void {
    this.authRedirect.redirecionar('/user/agendamento');
  }

  irParaPet(): void {
    this.authRedirect.redirecionar('/user/listar/pet');
  }

  // ---------- Planos ----------

  buscarPlanosCadastrados(): void {
    this.carregandoPlanos = true;

    this.http.get(`${environment.apiUrl}/adm/listar/produtos`, { withCredentials: true }).subscribe({
      next: (response: any) => {
        if (response && response.produtos) {
          const ordem = ['bronze', 'prata', 'ouro', 'diamante', 'personalizado'];
          this.planos = response.produtos
            .map((p: any) => this.montarPlano(p))
            .sort((a: any, b: any) => ordem.indexOf(a.nivel) - ordem.indexOf(b.nivel) || a.mensal - b.mensal);
          const destaque = this.planos.findIndex((p) => p.nivel === 'ouro');
          this.planoAtual = destaque >= 0 ? destaque : 0;
          this.planosLoop = [...this.planos, ...this.planos, ...this.planos].map((p, k) => ({ ...p, chave: k }));
          this.posPlano = this.planos.length + this.planoAtual;
        }

        this.carregandoPlanos = false;
        this.corrigirRolagemDaSecao();
      },
      error: (err) => {
        console.error('Erro ao buscar planos:', err);
        this.carregandoPlanos = false;
        this.corrigirRolagemDaSecao();
      }
    });
  }

  // Lê o plano do jeito que o admin salva:
  // nome "Plano Ouro | OURO | 349.90" (3º pedaço = preço anual por mês) e
  // benefícios "Banho e Tosa: 2x/mês; Exames de rotina: 2x/mês; ..."
  private montarPlano(p: any): any {
    const partes = String(p.nome || '').split(' | ');
    const nome = partes[0];
    const texto = `${partes[1] || ''} ${nome}`.toLowerCase();
    const nivel = ['bronze', 'prata', 'ouro', 'diamante'].find((n) => texto.includes(n)) || 'personalizado';

    const mensal = Number(p.preco) || 0;
    const anualSalvo = Number(String(partes[2] || '').replace(',', '.'));
    const anual = anualSalvo > 0
      ? anualSalvo
      : Math.round(mensal * (this.fatorAnual[nivel] ?? 1) * 100) / 100;

    const lista = this.beneficiosDoBanco(p.beneficios) ?? this.getBeneficiosDoPlano(nome);
    const beneficios = lista.map((b) => {
      const i = b.lastIndexOf(':');
      return i > 0 ? { texto: b.slice(0, i).trim(), quantidade: b.slice(i + 1).trim() } : { texto: b, quantidade: '' };
    });

    return {
      // campos usados na contratação (mantidos como antes)
      id_produto: p.id_produto,
      tag: partes[1] || 'PLANO ATIVO',
      nome,
      preco: formatarPreco(p.preco),
      descricao: p.descricao,
      beneficiosArray: lista,
      // campos do card
      nivel,
      cor: this.coresNivel[nivel],
      nomeCurto: nome.replace(/^Plano\s+/i, ''),
      resumo: p.descricao || '',
      mensal,
      anual,
      beneficios
    };
  }

  // ---------- Carrossel de planos (plano do centro fica maior e aberto) ----------

  // Vai para uma posição da lista repetida (k) e depois volta, sem animação, para a cópia do meio
  irParaPosicao(k: number): void {
    const n = this.planos.length;
    if (!n) {
      return;
    }
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

  // Pelas bolinhas: vai para o plano i pelo caminho mais curto
  irParaPlano(i: number): void {
    const n = this.planos.length;
    if (!n) {
      return;
    }
    let diferenca = i - this.planoAtual;
    if (diferenca > n / 2) diferenca -= n;
    if (diferenca < -n / 2) diferenca += n;
    this.irParaPosicao(this.posPlano + diferenca);
  }

  planoAnterior(): void {
    this.irParaPosicao(this.posPlano - 1);
  }

  proximoPlano(): void {
    this.irParaPosicao(this.posPlano + 1);
  }

  // Arrastar com o dedo no celular
  soltarToque(x: number): void {
    const dx = x - this.inicioToque;
    if (dx < -50) {
      this.proximoPlano();
    } else if (dx > 50) {
      this.planoAnterior();
    }
  }

  moeda(valor: number): string {
    return (valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  economia(p: any): number {
    return p.mensal > 0 && p.anual < p.mensal ? Math.round((1 - p.anual / p.mensal) * 100) : 0;
  }

  beneficiosDoBanco(beneficios: string | null | undefined): string[] | null {
    const itens = (beneficios ?? '').split(/[\n;]+/).map((b) => b.trim()).filter((b) => b.length > 0);
    return itens.length > 0 ? itens : null;
  }

  getBeneficiosDoPlano(nomePlano: string): string[] {
    if (nomePlano.includes('Inicial')) {
      return ['Check-up veterinário básico', 'Suporte para saúde preventiva', 'Descontos em consultas e exames', 'Carteirinha digital do pet', 'Lembretes de vacinação'];
    }
    if (nomePlano.includes('Essenciais')) {
      return ['2 consultas veterinárias mensais', 'Desconto em vacinas e exames', 'Prioridade em agendamentos', 'Teleorientação veterinária', 'Histórico digital do pet'];
    }
    if (nomePlano.includes('Abrangente')) {
      return ['4 consultas veterinárias mensais', 'Vacinação anual inclusa', 'Teleorientação veterinária', 'Exames laboratoriais com desconto', 'Acompanhamento preventivo'];
    }
    if (nomePlano.includes('Premium')) {
      return ['Consultas veterinárias ilimitadas', 'Descontos máximos em exames e procedimentos', 'Suporte exclusivo PetVitaliz', 'Atendimento de emergência', 'Prioridade máxima em agendamentos'];
    }
    return [];
  }

  inscreverNoPlano(plano: any): void {
    localStorage.setItem('planoSelecionado', JSON.stringify(plano));

    if (this.router.url.includes('/user/home')) {
      this.router.navigate(['/user/planos-pet']);
    } else {
      this.router.navigate(['/login']);
    }
  }
}
