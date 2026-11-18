import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

/* =========================================================
   Níveis de plano — mesmos do app mobile (src/data/planCoverage.ts)
   ========================================================= */
export type Nivel = 'bronze' | 'prata' | 'ouro' | 'diamante';
export type NivelForm = Nivel | 'personalizado';
export type Ciclo = 'mensal' | 'anual';

interface Beneficio {
  texto: string;
  quantidade: string;
}

interface ConfigNivel {
  id: Nivel;
  nome: string;
  cor: string;
  resumo: string;
  mensal: number;
  anual: number; // valor por mês no plano anual
  beneficios: Beneficio[];
}

export const NIVEIS: ConfigNivel[] = [
  {
    id: 'bronze', nome: 'Plano Bronze', cor: '#B87333',
    resumo: 'Banho e tosa + atendimento básico',
    mensal: 139.9, anual: 119.9,
    beneficios: [
      { texto: 'Banho e Tosa', quantidade: '1x/mês' },
      { texto: 'Atendimento veterinário básico', quantidade: '1x/mês' },
      { texto: 'Histórico de vacinas digital', quantidade: 'Incluso' },
      { texto: 'Atendimento 24h', quantidade: 'Incluso' },
      { texto: 'Desconto em medicamentos', quantidade: '10%' }
    ]
  },
  {
    id: 'prata', nome: 'Plano Prata', cor: '#A3ADBC',
    resumo: '+ vacinas e 2 consultas',
    mensal: 219.9, anual: 179.9,
    beneficios: [
      { texto: 'Banho e Tosa', quantidade: '1x/mês' },
      { texto: 'Consultas presenciais', quantidade: '2x/mês' },
      { texto: 'Vacinas anuais', quantidade: 'Inclusas' },
      { texto: 'Atendimento 24h', quantidade: 'Incluso' },
      { texto: 'Desconto em medicamentos', quantidade: '15%' }
    ]
  },
  {
    id: 'ouro', nome: 'Plano Ouro', cor: '#E3A912',
    resumo: '+ exames e consultas ilimitadas',
    mensal: 399.9, anual: 349.9,
    beneficios: [
      { texto: 'Banho e Tosa', quantidade: '2x/mês' },
      { texto: 'Exames de rotina', quantidade: '2x/mês' },
      { texto: 'Consultas presenciais', quantidade: 'Ilimitadas' },
      { texto: 'Vacinas anuais', quantidade: 'Inclusas' },
      { texto: 'Leva & Traz Pet', quantidade: '2x/mês' },
      { texto: 'Atendimento 24h', quantidade: 'Incluso' },
      { texto: 'Desconto em medicamentos', quantidade: '20%' }
    ]
  },
  {
    id: 'diamante', nome: 'Plano Diamante', cor: '#4FB3D9',
    resumo: '+ leva e traz ilimitado',
    mensal: 649.9, anual: 549.9,
    beneficios: [
      { texto: 'Banho e Tosa', quantidade: '2x/mês' },
      { texto: 'Consultas presenciais', quantidade: 'Ilimitadas' },
      { texto: 'Exames de rotina', quantidade: '2x/mês' },
      { texto: 'Vacinas anuais', quantidade: 'Inclusas' },
      { texto: 'Leva & Traz Pet', quantidade: 'Ilimitado' },
      { texto: 'Atendimento 24h', quantidade: 'Incluso' },
      { texto: 'Desconto em medicamentos', quantidade: '15%' }
    ]
  }
];

/** Cor usada nos planos personalizados (fora dos 4 níveis). */
export const COR_PERSONALIZADO = '#5D6ED3';

/** Plano lido da API, já no formato do app. */
interface Plano {
  id_produto?: number;
  nivel: NivelForm;
  nome: string;
  resumo: string;
  mensal: number;
  anual: number;
  beneficios: Beneficio[];
}

interface Assinante {
  pet: string;
  tutor: string;
  telefone: string;
  planoTexto: string;
  status: string;
}

@Component({
  selector: 'app-planos-adm',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './planos-adm.component.html',
  styleUrl: './planos-adm.component.css'
})
export class PlanosAdmComponent implements OnInit {

  readonly niveis = NIVEIS;

  ciclo: Ciclo = 'mensal';
  carregando = true;
  erroCarregar = '';

  /** Todos os planos da API, em ordem: Bronze, Prata, Ouro, Diamante, personalizados. */
  planos: Plano[] = [];

  // Assinantes (lidos de /adm/listar/clientes)
  assinantes: Assinante[] = [];
  carregandoAssinantes = true;
  apiTemPlanoDoCliente = false;
  filtroAssinantes: number | 'todos' = 'todos';
  buscaAssinante = '';

  // Formulário
  modalAberto = false;
  modoEdicao = false;
  salvando = false;
  cadastrandoPadroes = false;
  mensagemErro = '';
  mensagemSucesso = '';
  form: Plano = this.formVazio('bronze');

  planoParaExcluir: Plano | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.carregarPlanos();
    this.carregarAssinantes();
  }

  /* =========================================================
     API — mesmos endpoints de antes
     ========================================================= */
  carregarPlanos(): void {
    this.carregando = true;
    this.erroCarregar = '';
    this.http.get(`${environment.apiUrl}/adm/listar/produtos`, { withCredentials: true }).subscribe({
      next: (response: any) => {
        const ordem: NivelForm[] = ['bronze', 'prata', 'ouro', 'diamante', 'personalizado'];
        this.planos = (response?.produtos || [])
          .map((p: any) => this.lerProduto(p))
          .sort((a: Plano, b: Plano) => ordem.indexOf(a.nivel) - ordem.indexOf(b.nivel) || a.mensal - b.mensal);
        this.carregando = false;
      },
      error: (err) => {
        console.error('Erro ao buscar planos:', err);
        this.erroCarregar = 'Não foi possível carregar os planos.';
        this.carregando = false;
      }
    });
  }

  carregarAssinantes(): void {
    this.carregandoAssinantes = true;
    this.http.get<any>(`${environment.apiUrl}/adm/listar/clientes`, { withCredentials: true }).subscribe({
      next: (res) => {
        const clientes: any[] = res?.clientes || [];
        const lista: Assinante[] = [];
        let algumComCampoPlano = false;

        clientes.forEach((c: any) => {
          const planoTexto = this.textoPlanoDoCliente(c);
          if (planoTexto === null) return;
          algumComCampoPlano = true;
          lista.push({
            pet: c.nome || c.pet || 'Pet',
            tutor: c.tutor || '—',
            telefone: c.telefone || '',
            planoTexto,
            status: c.status || 'Ativo'
          });
        });

        this.apiTemPlanoDoCliente = algumComCampoPlano;
        this.assinantes = lista;
        this.carregandoAssinantes = false;
      },
      error: (err) => {
        console.error('Erro ao buscar assinantes:', err);
        this.carregandoAssinantes = false;
      }
    });
  }

  salvar(): void {
    this.mensagemErro = '';
    this.mensagemSucesso = '';

    const f = this.form;
    if (!f.nome.trim() || !f.mensal || !f.anual) {
      this.mensagemErro = 'Preencha nome, preço mensal e preço anual.';
      return;
    }
    if (!f.beneficios.some(b => b.texto.trim())) {
      this.mensagemErro = 'Adicione pelo menos um benefício.';
      return;
    }

    this.salvando = true;
    const payload = this.montarPayload(f);

    const req = this.modoEdicao && f.id_produto
      ? this.http.put(`${environment.apiUrl}/adm/listar/produtos/editar/${f.id_produto}`, payload, { withCredentials: true })
      : this.http.post(`${environment.apiUrl}/adm/listar/produtos/cadastrar`, payload, { withCredentials: true });

    req.subscribe({
      next: () => {
        this.mensagemSucesso = this.modoEdicao ? 'Plano atualizado com sucesso.' : 'Plano cadastrado com sucesso.';
        setTimeout(() => {
          this.modalAberto = false;
          this.salvando = false;
          this.carregarPlanos();
        }, 900);
      },
      error: (err) => {
        this.salvando = false;
        console.error(err);
        this.mensagemErro = typeof err.error === 'string' ? err.error : (err.error?.mensagem || 'Falha ao salvar o plano.');
      }
    });
  }

  /** Cadastra, um por um, os níveis do app que ainda não existem na API. */
  cadastrarPlanosDoApp(): void {
    const faltando = this.niveisFaltando;
    if (faltando.length === 0 || this.cadastrandoPadroes) return;

    this.cadastrandoPadroes = true;
    const proximo = (i: number) => {
      if (i >= faltando.length) {
        this.cadastrandoPadroes = false;
        this.carregarPlanos();
        return;
      }
      const payload = this.montarPayload(this.formVazio(faltando[i].id));
      this.http.post(`${environment.apiUrl}/adm/listar/produtos/cadastrar`, payload, { withCredentials: true }).subscribe({
        next: () => proximo(i + 1),
        error: (err) => {
          console.error('Erro ao cadastrar plano do app:', err);
          proximo(i + 1);
        }
      });
    };
    proximo(0);
  }

  confirmarExclusao(): void {
    const plano = this.planoParaExcluir;
    this.planoParaExcluir = null;
    if (!plano?.id_produto) return;

    this.http.delete(`${environment.apiUrl}/adm/listar/produtos/excluir/${plano.id_produto}`, { withCredentials: true }).subscribe({
      next: () => this.carregarPlanos(),
      error: (err) => console.error('Erro ao excluir plano:', err)
    });
  }

  /* =========================================================
     Conversão API <-> formato do app
     ---------------------------------------------------------
     Campos que já existem no backend:
     nome        -> "Plano Ouro | OURO | 349.90"  (3º pedaço = preço anual por mês)
     preco       -> preço mensal
     descricao   -> resumo
     beneficios  -> "Banho e Tosa: 2x/mês; Exames de rotina: 2x/mês; ..."
     ========================================================= */
  private montarPayload(f: Plano) {
    const tag = f.nivel === 'personalizado' ? 'PERSONALIZADO' : f.nivel.toUpperCase();
    return {
      nome: `${f.nome.trim()} | ${tag} | ${Number(f.anual).toFixed(2)}`,
      descricao: (f.resumo || '').trim(),
      beneficios: f.beneficios
        .filter(b => b.texto.trim())
        .map(b => b.quantidade.trim() ? `${b.texto.trim()}: ${b.quantidade.trim()}` : b.texto.trim())
        .join('; '),
      preco: Number(f.mensal)
    };
  }

  private lerProduto(p: any): Plano {
    const partes = String(p.nome || '').split(' | ');
    const nome = partes[0] || 'Plano';
    const nivel: NivelForm = this.detectarNivel(`${partes[1] || ''} ${nome}`) || 'personalizado';
    const config = nivel !== 'personalizado' ? this.configDo(nivel) : null;

    const mensal = Number(p.preco) || 0;
    const anualSalvo = Number(String(partes[2] || '').replace(',', '.'));
    const anual = anualSalvo > 0
      ? anualSalvo
      : (config ? Math.round(mensal * (config.anual / config.mensal) * 100) / 100 : mensal);

    const beneficios: Beneficio[] = String(p.beneficios || '')
      .split(/[\n;]+/)
      .map((b: string) => b.trim())
      .filter((b: string) => b.length > 0)
      .map((b: string) => {
        const i = b.lastIndexOf(':');
        return i > 0
          ? { texto: b.slice(0, i).trim(), quantidade: b.slice(i + 1).trim() }
          : { texto: b, quantidade: '' };
      });

    return {
      id_produto: p.id_produto,
      nivel,
      nome,
      resumo: p.descricao || config?.resumo || '',
      mensal,
      anual,
      beneficios
    };
  }

  detectarNivel(texto: string): Nivel | null {
    const t = this.normalizar(texto);
    return (['bronze', 'prata', 'ouro', 'diamante'] as Nivel[]).find(n => t.includes(n)) || null;
  }

  private normalizar(texto: string): string {
    return (texto || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  /** Procura o plano do cliente nos campos mais prováveis da resposta da API. */
  private textoPlanoDoCliente(c: any): string | null {
    const candidatos = [
      c?.plano, c?.plano_nome, c?.nome_plano, c?.planoNome,
      c?.plano?.nome, c?.produto?.nome, c?.assinatura?.nome, c?.assinatura?.plano
    ];
    for (const v of candidatos) {
      if (typeof v === 'string' && v.trim()) return v;
    }
    return null;
  }

  configDo(nivel: Nivel): ConfigNivel {
    return NIVEIS.find(n => n.id === nivel) as ConfigNivel;
  }

  /* =========================================================
     Tela
     ========================================================= */
  corDo(nivel: NivelForm): string {
    return nivel === 'personalizado' ? COR_PERSONALIZADO : this.configDo(nivel).cor;
  }

  nomeCurto(p: Plano): string {
    return p.nome.replace(/^Plano\s+/i, '');
  }

  precoPorMes(p: Plano): number {
    return this.ciclo === 'anual' ? p.anual : p.mensal;
  }

  totalAnual(p: Plano): number {
    return Math.round(p.anual * 12 * 100) / 100;
  }

  economia(p: Plano): number {
    if (!p.mensal) return 0;
    return Math.round((1 - p.anual / p.mensal) * 100);
  }

  get maiorEconomia(): number {
    const valores = this.planos.map(p => this.economia(p));
    return valores.length ? Math.max(0, ...valores) : 18;
  }

  get niveisFaltando(): ConfigNivel[] {
    return NIVEIS.filter(n => !this.planos.some(p => p.nivel === n.id));
  }

  /** O assinante pertence a este plano? (pelo nível ou, nos personalizados, pelo nome) */
  private assinanteDoPlano(a: Assinante, p: Plano): boolean {
    if (p.nivel !== 'personalizado') return this.detectarNivel(a.planoTexto) === p.nivel;
    return this.normalizar(a.planoTexto).includes(this.normalizar(p.nome));
  }

  assinantesDo(p: Plano): number {
    return this.assinantes.filter(a => this.assinanteDoPlano(a, p)).length;
  }

  planoDoAssinante(a: Assinante): Plano | undefined {
    return this.planos.find(p => this.assinanteDoPlano(a, p));
  }

  get assinantesFiltrados(): Assinante[] {
    const termo = this.buscaAssinante.trim().toLowerCase();
    const plano = this.filtroAssinantes === 'todos' ? null : this.planos.find(p => p.id_produto === this.filtroAssinantes);
    return this.assinantes.filter(a =>
      (!plano || this.assinanteDoPlano(a, plano)) &&
      (!termo || `${a.pet} ${a.tutor} ${a.telefone}`.toLowerCase().includes(termo))
    );
  }

  get receitaMensalEstimada(): number {
    return this.assinantes.reduce((total, a) => total + (this.planoDoAssinante(a)?.mensal || 0), 0);
  }

  moeda(valor: number): string {
    return (valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  /* =========================================================
     Formulário
     ========================================================= */
  private formVazio(nivel: NivelForm): Plano {
    if (nivel === 'personalizado') {
      return {
        nivel,
        nome: '',
        resumo: '',
        mensal: 0,
        anual: 0,
        beneficios: [{ texto: '', quantidade: '' }]
      };
    }
    const c = this.configDo(nivel);
    return {
      nivel,
      nome: c.nome,
      resumo: c.resumo,
      mensal: c.mensal,
      anual: c.anual,
      beneficios: c.beneficios.map(b => ({ ...b }))
    };
  }

  novoPlano(nivel?: NivelForm): void {
    this.modoEdicao = false;
    this.mensagemErro = '';
    this.mensagemSucesso = '';
    this.form = this.formVazio(nivel || this.niveisFaltando[0]?.id || 'personalizado');
    this.modalAberto = true;
  }

  editar(plano: Plano): void {
    this.modoEdicao = true;
    this.mensagemErro = '';
    this.mensagemSucesso = '';
    this.form = {
      ...plano,
      beneficios: plano.beneficios.length ? plano.beneficios.map(b => ({ ...b })) : [{ texto: '', quantidade: '' }]
    };
    this.modalAberto = true;
  }

  trocarNivelDoForm(nivel: NivelForm): void {
    // Ao editar, só troca o nível (mantém preços e benefícios digitados).
    if (this.modoEdicao) {
      this.form.nivel = nivel;
      return;
    }
    this.form = this.formVazio(nivel);
  }

  restaurarPadraoDoApp(): void {
    if (this.form.nivel === 'personalizado') return;
    const padrao = this.formVazio(this.form.nivel);
    this.form = { ...padrao, id_produto: this.form.id_produto };
  }

  adicionarBeneficio(): void {
    this.form.beneficios.push({ texto: '', quantidade: '' });
  }

  removerBeneficio(i: number): void {
    this.form.beneficios.splice(i, 1);
  }

  fecharModal(): void {
    if (!this.salvando) this.modalAberto = false;
  }

  excluir(plano: Plano): void {
    this.planoParaExcluir = plano;
  }
}