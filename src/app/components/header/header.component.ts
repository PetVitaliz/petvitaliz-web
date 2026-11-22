import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { Subscription, filter } from 'rxjs';

type Sugestao = {
  texto: string;
  palavras: string[];
  rota: string;
  fragment?: string;
};

type CepInfo = {
  cep: string;
  bairro: string;
  cidade: string;
  uf: string;
};

type SugestaoExibida = Sugestao & {
  antes: string;
  destaque: string;
  depois: string;
};

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit, OnDestroy {

  menuAberto = false;
  submenuAberto: 'servicos' | 'planos' | null = null;

  servicos = [
    { icone: 'stethoscope', titulo: 'Consultas', descricao: 'Check-ups e retornos' },
    { icone: 'vaccines', titulo: 'Vacinação', descricao: 'Calendário em dia' },
    { icone: 'shower', titulo: 'Higiene', descricao: 'Unhas e ouvidos' },
    { icone: 'home_health', titulo: 'Hospedagem e creche', descricao: 'Brincadeira e cuidado' }
  ];

  // ---------- Busca com sugestões ----------

  termoBusca = '';
  sugestoesVisiveis = false;
  indiceAtivo = -1;
  sugestoesFiltradas: SugestaoExibida[] = [];

  private readonly maxSugestoes = 6;

  // Aparecem quando a pessoa clica na busca sem digitar nada
  private readonly populares = ['Planos de saúde', 'Consultas veterinárias', 'Vacinação', 'Adotar um pet'];

  private readonly sugestoes: Sugestao[] = [
    { texto: 'Planos de saúde', palavras: ['plano', 'saude', 'assinatura', 'mensalidade', 'convenio'], rota: '/', fragment: 'planos' },
    { texto: 'Comparar planos', palavras: ['plano', 'preco', 'valor', 'cobertura'], rota: '/', fragment: 'planos' },
    { texto: 'Consultas veterinárias', palavras: ['consulta', 'veterinario', 'vet', 'medico', 'agendar'], rota: '/', fragment: 'servicos' },
    { texto: 'Check-up', palavras: ['checkup', 'exame', 'rotina'], rota: '/', fragment: 'servicos' },
    { texto: 'Vacinação', palavras: ['vacina', 'vermifugo', 'raiva', 'v10', 'v8'], rota: '/', fragment: 'servicos' },
    { texto: 'Banho e higiene', palavras: ['banho', 'higiene', 'tosa', 'limpeza'], rota: '/', fragment: 'servicos' },
    { texto: 'Corte de unhas', palavras: ['unha', 'higiene'], rota: '/', fragment: 'servicos' },
    { texto: 'Limpeza de ouvido', palavras: ['ouvido', 'orelha', 'higiene'], rota: '/', fragment: 'servicos' },
    { texto: 'Hospedagem e creche', palavras: ['hospedagem', 'hotel', 'creche', 'viagem', 'cuidador'], rota: '/', fragment: 'servicos' },
    { texto: 'Adotar um pet', palavras: ['adotar', 'adocao', 'adote', 'abrigo'], rota: '/', fragment: 'adocao' },
    { texto: 'Adoção de cachorros', palavras: ['cachorro', 'cao', 'filhote', 'adotar'], rota: '/', fragment: 'adocao' },
    { texto: 'Adoção de gatos', palavras: ['gato', 'gatinho', 'felino', 'adotar'], rota: '/', fragment: 'adocao' },
    { texto: 'Sobre a PetVitaliz', palavras: ['sobre', 'clinica', 'historia', 'empresa'], rota: '/', fragment: 'sobre' },
    { texto: 'Fale conosco', palavras: ['contato', 'telefone', 'whatsapp', 'email', 'endereco', 'ajuda'], rota: '/', fragment: 'contato' },
    { texto: 'Entrar na minha conta', palavras: ['entrar', 'login', 'conta', 'acessar'], rota: '/login' },
    { texto: 'Criar conta', palavras: ['cadastro', 'cadastrar', 'registrar', 'conta'], rota: '/cadastro' },
    { texto: 'Esqueci minha senha', palavras: ['senha', 'recuperar', 'esqueci'], rota: '/esqueci-senha' }
  ];

  constructor(private router: Router) {}

  private normalizar(valor: string): string {
    return valor.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
  }

  // Separa o texto em antes / parte digitada / depois, para destacar em negrito
  private marcar(sugestao: Sugestao, termo: string): SugestaoExibida {
    const pos = termo ? this.normalizar(sugestao.texto).indexOf(termo) : -1;

    if (pos < 0) {
      return { ...sugestao, antes: sugestao.texto, destaque: '', depois: '' };
    }

    return {
      ...sugestao,
      antes: sugestao.texto.slice(0, pos),
      destaque: sugestao.texto.slice(pos, pos + termo.length),
      depois: sugestao.texto.slice(pos + termo.length)
    };
  }

  atualizarSugestoes(): void {
    const termo = this.normalizar(this.termoBusca);
    this.indiceAtivo = -1;

    if (!termo) {
      this.sugestoesFiltradas = this.sugestoes
        .filter((s) => this.populares.includes(s.texto))
        .map((s) => this.marcar(s, ''));
      return;
    }

    // Primeiro o que começa com o termo, depois o que contém, depois por palavra-chave
    const comeca: Sugestao[] = [];
    const contem: Sugestao[] = [];
    const porPalavra: Sugestao[] = [];

    for (const s of this.sugestoes) {
      const texto = this.normalizar(s.texto);
      if (texto.startsWith(termo)) {
        comeca.push(s);
      } else if (texto.includes(termo)) {
        contem.push(s);
      } else if (s.palavras.some((p) => p.startsWith(termo) || (termo.length >= 3 && termo.includes(p)))) {
        porPalavra.push(s);
      }
    }

    this.sugestoesFiltradas = [...comeca, ...contem, ...porPalavra]
      .slice(0, this.maxSugestoes)
      .map((s) => this.marcar(s, termo));
  }

  abrirSugestoes(): void {
    this.atualizarSugestoes();
    this.sugestoesVisiveis = true;
  }

  fecharSugestoes(): void {
    this.sugestoesVisiveis = false;
    this.indiceAtivo = -1;
  }

  aoDigitar(): void {
    this.sugestoesVisiveis = true;
    this.atualizarSugestoes();
  }

  // Setas para navegar, Enter para escolher, Esc para fechar
  aoTeclar(evento: KeyboardEvent): void {
    const total = this.sugestoesFiltradas.length;

    if (evento.key === 'ArrowDown' && total) {
      evento.preventDefault();
      this.sugestoesVisiveis = true;
      this.indiceAtivo = (this.indiceAtivo + 1) % total;
    } else if (evento.key === 'ArrowUp' && total) {
      evento.preventDefault();
      this.indiceAtivo = this.indiceAtivo <= 0 ? total - 1 : this.indiceAtivo - 1;
    } else if (evento.key === 'Escape') {
      this.fecharSugestoes();
    }
  }

  escolher(sugestao: Sugestao): void {
    this.termoBusca = '';
    this.fecharSugestoes();

    if (sugestao.rota === '/' && sugestao.fragment) {
      this.irPara(null, sugestao.fragment);
      return;
    }

    this.router.navigate([sugestao.rota]);
    this.fecharMenu();
  }

  buscar(): void {
    if (this.indiceAtivo >= 0 && this.sugestoesFiltradas[this.indiceAtivo]) {
      this.escolher(this.sugestoesFiltradas[this.indiceAtivo]);
      return;
    }

    if (!this.normalizar(this.termoBusca)) {
      return;
    }

    this.atualizarSugestoes();

    if (this.sugestoesFiltradas.length) {
      this.escolher(this.sugestoesFiltradas[0]);
    } else {
      // Nada parecido: leva para Serviços
      this.escolher({ texto: '', palavras: [], rota: '/', fragment: 'servicos' });
    }
  }

  // ---------- CEP ----------

  @ViewChild('cepArea') cepArea?: ElementRef<HTMLElement>;

  cepAberto = false;
  cepDigitado = '';
  cepInfo: CepInfo | null = null;
  buscandoCep = false;
  erroCep = '';

  private readonly chaveCep = 'cepPetVitaliz';

  private carregarCepSalvo(): void {
    try {
      const salvo = localStorage.getItem(this.chaveCep);
      this.cepInfo = salvo ? JSON.parse(salvo) : null;
      this.cepDigitado = this.cepInfo?.cep ?? '';
    } catch {
      this.cepInfo = null;
    }
  }

  get mensagemCep(): string {
    if (!this.cepInfo) {
      return '';
    }
    if (this.cepInfo.uf === 'SP' && this.cepInfo.cidade === 'São Paulo') {
      return 'Você está na mesma cidade da nossa unidade: Av. Paulista, 1000 - Bela Vista.';
    }
    return 'Nossa unidade fica na Av. Paulista, 1000 - Bela Vista, São Paulo/SP.';
  }

  toggleCep(): void {
    this.cepAberto = !this.cepAberto;
    this.erroCep = '';
  }

  // Formata enquanto digita: 00000-000
  mascararCep(): void {
    const n = this.cepDigitado.replace(/\D/g, '').slice(0, 8);
    this.cepDigitado = n.length > 5 ? `${n.slice(0, 5)}-${n.slice(5)}` : n;
  }

  async buscarCep(): Promise<void> {
    const numeros = this.cepDigitado.replace(/\D/g, '');
    this.erroCep = '';

    if (numeros.length !== 8) {
      this.erroCep = 'Digite os 8 números do CEP.';
      return;
    }

    this.buscandoCep = true;

    try {
      // fetch direto (sem o interceptor do app) para a API pública ViaCEP
      const resposta = await fetch(`https://viacep.com.br/ws/${numeros}/json/`);
      const dados = await resposta.json();

      if (!resposta.ok || dados.erro) {
        this.erroCep = 'CEP não encontrado. Confira os números.';
        return;
      }

      this.cepInfo = {
        cep: `${numeros.slice(0, 5)}-${numeros.slice(5)}`,
        bairro: dados.bairro || '',
        cidade: dados.localidade || '',
        uf: dados.uf || ''
      };
      localStorage.setItem(this.chaveCep, JSON.stringify(this.cepInfo));
    } catch {
      this.erroCep = 'Não foi possível consultar o CEP agora. Tente de novo.';
    } finally {
      this.buscandoCep = false;
    }
  }

  limparCep(): void {
    localStorage.removeItem(this.chaveCep);
    this.cepInfo = null;
    this.cepDigitado = '';
  }

  // Fecha o quadro do CEP ao clicar fora dele ou apertar Esc
  @HostListener('document:click', ['$event'])
  aoClicarFora(e: MouseEvent): void {
    if (this.cepAberto && this.cepArea && !this.cepArea.nativeElement.contains(e.target as Node)) {
      this.cepAberto = false;
    }
  }

  @HostListener('document:keydown.escape')
  aoApertarEsc(): void {
    this.cepAberto = false;
  }

  // ---------- Seções da home ----------

  // Ordem das seções na home (usada para sublinhar o item do menu durante a rolagem)
  private readonly secoes = ['planos', 'servicos', 'adocao', 'sobre', 'contato'];
  secaoAtiva: string | null = null;
  private sub?: Subscription;

  ngOnInit(): void {
    this.carregarCepSalvo();
    this.sub = this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => setTimeout(() => this.atualizarSecaoAtiva(), 50));
    setTimeout(() => this.atualizarSecaoAtiva(), 50);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private estaNaHome(): boolean {
    const rota = this.router.url.split('?')[0].split('#')[0];
    return rota === '/' || rota === '/home';
  }

  @HostListener('window:scroll')
  atualizarSecaoAtiva(): void {
    if (!this.estaNaHome()) {
      this.secaoAtiva = null;
      return;
    }

    let atual = 'topo';
    for (const id of this.secoes) {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= 160) {
        atual = id;
      }
    }

    // No fim da página, marca a última seção
    if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) {
      atual = this.secoes[this.secoes.length - 1];
    }

    this.secaoAtiva = atual;
  }

  // Rola até a seção se já estiver na home; senão abre a home na seção
  irPara(evento: Event | null, secao: string): void {
    evento?.preventDefault();
    this.fecharMenu();

    if (this.estaNaHome()) {
      if (secao === 'topo') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        document.getElementById(secao)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return;
    }

    this.router.navigate(['/'], secao === 'topo' ? {} : { fragment: secao });
  }

  // ---------- Menu ----------

  toggleMenu(): void {
    this.menuAberto = !this.menuAberto;
    if (!this.menuAberto) {
      this.submenuAberto = null;
    }
  }

  // No celular abre/fecha a seção; no computador o menu abre ao passar o mouse
  toggleSubmenu(nome: 'servicos' | 'planos'): void {
    this.submenuAberto = this.submenuAberto === nome ? null : nome;
  }

  fecharMenu(): void {
    this.menuAberto = false;
    this.submenuAberto = null;
    // tira o foco do link clicado para o menu suspenso fechar no computador
    (document.activeElement as HTMLElement | null)?.blur();
  }

}
