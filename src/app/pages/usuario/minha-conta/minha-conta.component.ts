import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, Subscription, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { lerPlanosDoCliente } from '../../../core/utils/planos-resposta';
import { IconePetComponent } from '../../../components/icone-pet/icone-pet.component';
import { montarPlano } from '../../../core/utils/montar-plano';
import { SairService } from '../../../core/services/sair.service';
import { processarCancelamentosVencidos } from '../../../core/utils/assinaturas';

type Secao = 'dados' | 'pagamento' | 'notificacoes' | 'seguranca' | 'termos';

type Cartao = {
  id: string;
  bandeira: string;
  final: string;
  nome: string;
  validade: string;
  principal: boolean;
};

type Aviso = {
  icone: string;
  tom: 'azul' | 'verde' | 'amarelo';
  titulo: string;
  texto: string;
  rota: string;
};

// Mesma área "Meu perfil" do app mobile
@Component({
  selector: 'app-minha-conta',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IconePetComponent],
  templateUrl: './minha-conta.component.html',
  styleUrl: './minha-conta.component.css'
})
export class MinhaContaComponent implements OnInit, OnDestroy {

  secao: Secao | null = null;
  private sub?: Subscription;

  readonly itensConta = [
    { secao: 'dados' as Secao, icone: 'person', titulo: 'Dados pessoais' },
    { secao: 'pagamento' as Secao, icone: 'credit_card', titulo: 'Formas de pagamento' },
    { secao: 'notificacoes' as Secao, icone: 'notifications', titulo: 'Notificações' },
    { secao: 'seguranca' as Secao, icone: 'shield', titulo: 'Segurança' }
  ];

  readonly titulos: Record<Secao, string> = {
    dados: 'Dados pessoais',
    pagamento: 'Formas de pagamento',
    notificacoes: 'Notificações',
    seguranca: 'Segurança',
    termos: 'Termos e privacidade'
  };

  // ---------- Dados da conta ----------
  carregando = true;
  perfil = { nome: '', email: '', cpf: '', telefone: '', nascimento: '' };
  private bruto = { nome: '', sobrenome: '', nascimentoIso: '' };

  // Edição dos dados pessoais
  editando = false;
  salvandoDados = false;
  erroDados = '';
  okDados = '';
  edicao = { nome: '', sobrenome: '', telefone: '', nascimento: '' };
  readonly hojeIso = new Date().toISOString().split('T')[0];
  qtdPets = 0;
  falhouPets = false;
  falhouConsultas = false;
  falhouPlanos = false;
  petsResumo: { id_pet: number; nome: string; especie: string; foto_url: string | null; idade: string; plano: string; cor: string }[] = [];
  private abrirEdicao = false;
  qtdConsultas = 0;
  qtdPlanos = 0;
  avisos: Aviso[] = [];

  constructor(private http: HttpClient, private route: ActivatedRoute, private router: Router, private sairService: SairService) {}

  ngOnInit(): void {
    this.sub = this.route.paramMap.subscribe((p) => {
      const s = p.get('secao') as Secao | null;
      this.secao = s && s in this.titulos ? s : null;
      this.fecharFormCartao();
      window.scrollTo({ top: 0 });
    });

    // "Editar dados" da página inicial chega aqui com ?editar=1
    this.abrirEdicao = this.route.snapshot.queryParamMap.get('editar') === '1';

    this.carregarPreferencias();
    this.carregarCartoes();
    processarCancelamentosVencidos(this.http, environment.apiUrl, () => this.carregarDados());
    this.carregarDados();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private get usuarioSalvo(): any {
    try {
      return JSON.parse(localStorage.getItem('usuarioLogado') || 'null');
    } catch {
      return null;
    }
  }

  get inicial(): string {
    return (this.perfil.nome || this.perfil.email || 'C').trim().charAt(0).toUpperCase();
  }

  private carregarDados(): void {
    const u = this.usuarioSalvo;
    this.perfil.nome = u?.nome || u?.nomeCompleto || '';
    this.perfil.email = u?.email || '';

    const opcoes = { withCredentials: true };
    const seguro = (obs: Observable<any>) => obs.pipe(catchError(() => of(null)));

    forkJoin({
      perfil: seguro(this.http.get<any>(`${environment.apiUrl}/user/buscar/perfil`, opcoes)),
      pets: seguro(this.http.get<any>(`${environment.apiUrl}/user/listar/pet`, opcoes)),
      planos: seguro(this.http.get<any>(`${environment.apiUrl}/user/planos`, opcoes)),
      consultas: seguro(this.http.get<any>(`${environment.apiUrl}/consultas`, opcoes))
    }).subscribe((r: any) => {
      this.carregando = false;

      this.brutos = r;
      const p = r.perfil;
      if (p) {
        this.perfil.nome = [p.nome, p.sobrenome].filter(Boolean).join(' ') || this.perfil.nome;
        this.perfil.email = p.email || this.perfil.email;
        this.perfil.cpf = this.formatarCpf(p.CPF || p.cpf || '');
        this.perfil.telefone = p.telefone || p.celular || '';
        const nasc = p.data_nascimento || p.dataNascimento || '';
        this.perfil.nascimento = nasc ? String(nasc).split('T')[0].split('-').reverse().join('/') : '';
        this.bruto = { nome: p.nome || '', sobrenome: p.sobrenome || '', nascimentoIso: nasc ? String(nasc).split('T')[0] : '' };
      }

      const pets: any[] = r.pets?.pets || r.pets?.Pets || [];
      const planos: any[] = lerPlanosDoCliente(r.planos);
      const hoje = new Date().toISOString().split('T')[0];
      const proximas = (r.consultas?.consultas || [])
        .filter((c: any) => c.data_consulta && c.data_consulta.split('T')[0] >= hoje)
        .filter((c: any) => !String(c.status || '').toLowerCase().includes('cancel'))
        .sort((a: any, b: any) => String(a.data_consulta).localeCompare(String(b.data_consulta)));

      this.falhouPets = !r.pets;
      this.falhouConsultas = !r.consultas;
      this.falhouPlanos = !r.planos;
      this.petsResumo = pets.map((pet: any) => {
        const pl = planos.find((x: any) => Number(x.id_pet) === Number(pet.id_pet));
        const montado = pl ? montarPlano(pl.produto || {}) : null;
        return {
          id_pet: pet.id_pet,
          nome: pet.nome,
          especie: pet.especie || '',
          foto_url: pet.foto_url || null,
          idade: this.idadePet(pet.data_nascimento),
          plano: montado ? montado.nome : '',
          cor: montado ? montado.cor : ''
        };
      });
      if (this.abrirEdicao && this.secao === 'dados') {
        this.abrirEdicao = false;
        this.comecarEdicao();
      }
      this.qtdPets = pets.length;
      this.qtdPlanos = planos.length;
      this.qtdConsultas = proximas.length;

      // Avisos (como na tela de notificações do app)
      this.avisos = [
        ...(this.prefs.consultas ? proximas.slice(0, 3).map((c: any) => ({
          icone: 'event',
          tom: 'azul' as const,
          titulo: `Consulta de ${c.pet?.nome || 'seu pet'}`,
          texto: `${this.diaDaConsulta(c.data_consulta)}${c.hora_inicio ? ' às ' + String(c.hora_inicio).slice(0, 5) : ''}`,
          rota: '/user/agendamento'
        })) : []),
        ...planos.slice(0, 2).map((pl: any) => ({
          icone: 'verified',
          tom: 'verde' as const,
          titulo: 'Plano ativo',
          texto: `${String(pl.produto?.nome || 'Plano').split(' | ')[0]} para ${pets.find((x) => x.id_pet === pl.id_pet)?.nome || 'seu pet'}`,
          rota: '/user/meu-plano'
        }))
      ];
    });
  }

  private diaDaConsulta(iso: string): string {
    const [a, m, d] = String(iso).split('T')[0].split('-').map(Number);
    const data = new Date(a, m - 1, d);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dif = Math.round((data.getTime() - hoje.getTime()) / 86400000);
    if (dif === 0) return 'Hoje';
    if (dif === 1) return 'Amanhã';
    const txt = data.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' });
    return txt.charAt(0).toUpperCase() + txt.slice(1);
  }

  private formatarCpf(v: string): string {
    const n = String(v).replace(/\D/g, '');
    return n.length === 11 ? `${n.slice(0, 3)}.${n.slice(3, 6)}.${n.slice(6, 9)}-${n.slice(9)}` : n;
  }

  private idadePet(nasc: string | null | undefined): string {
    if (!nasc) return '';
    const [a, m, d] = String(nasc).split('T')[0].split('-').map(Number);
    if (!a) return '';
    const hoje = new Date();
    let meses = (hoje.getFullYear() - a) * 12 + (hoje.getMonth() + 1 - m) - (hoje.getDate() < (d || 1) ? 1 : 0);
    if (meses < 0) meses = 0;
    if (meses < 12) return meses <= 1 ? (meses === 1 ? '1 mês' : 'Menos de 1 mês') : `${meses} meses`;
    const anos = Math.floor(meses / 12);
    return anos === 1 ? '1 ano' : `${anos} anos`;
  }

  numero(n: number, falhou: boolean): string {
    return this.carregando ? '…' : falhou ? '—' : String(n);
  }

  // ---------- Segurança ----------

  private brutos: any = {};

  // Navegador e sistema deste aparelho (só o que o próprio navegador informa)
  get aparelho(): string {
    const ua = navigator.userAgent;
    const nav = /Edg\//.test(ua) ? 'Edge' : /OPR\//.test(ua) ? 'Opera' : /Chrome\//.test(ua) ? 'Chrome'
      : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'Navegador';
    const so = /Windows/.test(ua) ? 'Windows' : /Android/.test(ua) ? 'Android' : /iPhone|iPad/.test(ua) ? 'iOS'
      : /Mac OS X/.test(ua) ? 'macOS' : /Linux/.test(ua) ? 'Linux' : 'seu sistema';
    return `${nav} no ${so}`;
  }

  baixarDados(): void {
    const r = this.brutos || {};
    const dados = {
      geradoEm: new Date().toISOString(),
      perfil: { ...this.perfil },
      pets: r.pets?.pets || r.pets?.Pets || [],
      planos: lerPlanosDoCliente(r.planos),
      consultas: r.consultas?.consultas || [],
      cartoesSalvos: this.cartoes.map((c: any) => ({ bandeira: c.bandeira, final: c.final, validade: c.validade })),
      preferenciasDeAvisos: { ...this.prefs }
    };
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meus-dados-petvitaliz-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  plural(n: number, um: string, varios: string, nenhum: string): string {
    return n === 0 ? nenhum : `${n} ${n === 1 ? um : varios}`;
  }

  // ---------- Notificações (preferências ficam neste navegador) ----------
  prefs = { consultas: true, vacinas: true, ofertas: false };

  readonly opcoesAviso = [
    { chave: 'consultas' as const, titulo: 'Consultas', texto: 'Lembretes e mudanças de horário' },
    { chave: 'vacinas' as const, titulo: 'Vacinas', texto: 'Doses que estão chegando' },
    { chave: 'ofertas' as const, titulo: 'Ofertas', texto: 'Descontos em planos e serviços' }
  ];

  private chave(nome: string): string {
    return `${nome}PetVitaliz:${this.usuarioSalvo?.email || 'cliente'}`;
  }

  private carregarPreferencias(): void {
    try {
      const salvo = JSON.parse(localStorage.getItem(this.chave('avisos')) || 'null');
      if (salvo) this.prefs = { ...this.prefs, ...salvo };
    } catch { /* usa o padrão */ }
  }

  salvarPreferencias(): void {
    localStorage.setItem(this.chave('avisos'), JSON.stringify(this.prefs));
  }

  // ---------- Formas de pagamento ----------
  // Guardamos só bandeira, 4 últimos números, nome e validade (nunca o número completo nem o CVV)
  cartoes: Cartao[] = [];
  formCartaoAberto = false;
  novo = { numero: '', nome: '', validade: '', cvv: '', principal: true };
  erroCartao = '';
  avisoCartao = '';

  private carregarCartoes(): void {
    try {
      this.cartoes = JSON.parse(localStorage.getItem(this.chave('cartoes')) || '[]');
    } catch {
      this.cartoes = [];
    }
  }

  private salvarCartoes(): void {
    localStorage.setItem(this.chave('cartoes'), JSON.stringify(this.cartoes));
  }

  get bandeiraDigitada(): string {
    const n = this.novo.numero.replace(/\D/g, '');
    if (/^4/.test(n)) return 'Visa';
    if (/^(5[1-5]|2[2-7])/.test(n)) return 'Mastercard';
    if (/^3[47]/.test(n)) return 'Amex';
    if (/^(636368|438935|504175|451416|636297|5067|4576|4011|506699)/.test(n)) return 'Elo';
    return 'Cartão';
  }

  abrirFormCartao(): void {
    this.novo = { numero: '', nome: '', validade: '', cvv: '', principal: this.cartoes.length === 0 };
    this.erroCartao = '';
    this.avisoCartao = '';
    this.formCartaoAberto = true;
  }

  fecharFormCartao(): void {
    this.formCartaoAberto = false;
    this.erroCartao = '';
  }

  mascararNumero(): void {
    const n = this.novo.numero.replace(/\D/g, '').slice(0, 16);
    this.novo.numero = n.replace(/(\d{4})(?=\d)/g, '$1 ');
  }

  mascararValidade(): void {
    const n = this.novo.validade.replace(/\D/g, '').slice(0, 4);
    this.novo.validade = n.length > 2 ? `${n.slice(0, 2)}/${n.slice(2)}` : n;
  }

  mascararCvv(): void {
    this.novo.cvv = this.novo.cvv.replace(/\D/g, '').slice(0, 4);
  }

  adicionarCartao(): void {
    const numero = this.novo.numero.replace(/\D/g, '');
    const [mm, aa] = this.novo.validade.split('/').map(Number);
    const agora = new Date();
    const fimValidade = new Date(2000 + (aa || 0), mm || 0, 0, 23, 59);

    if (numero.length < 13) {
      this.erroCartao = 'Confira o número do cartão.';
    } else if (!this.novo.nome.trim()) {
      this.erroCartao = 'Digite o nome como está no cartão.';
    } else if (!mm || mm > 12 || !aa || fimValidade < agora) {
      this.erroCartao = 'Use o formato MM/AA e uma data futura.';
    } else if (this.novo.cvv.length < 3) {
      this.erroCartao = 'Digite os 3 ou 4 números do verso.';
    } else {
      const principal = this.novo.principal || this.cartoes.length === 0;
      if (principal) this.cartoes.forEach((c) => (c.principal = false));
      this.cartoes.push({
        id: String(Date.now()),
        bandeira: this.bandeiraDigitada,
        final: numero.slice(-4),
        nome: this.novo.nome.trim().toUpperCase(),
        validade: this.novo.validade,
        principal
      });
      this.salvarCartoes();
      this.formCartaoAberto = false;
      this.avisoCartao = 'Cartão adicionado.';
      this.novo = { numero: '', nome: '', validade: '', cvv: '', principal: false };
    }
  }

  tornarPrincipal(c: Cartao): void {
    this.cartoes.forEach((x) => (x.principal = x.id === c.id));
    this.salvarCartoes();
  }

  excluirCartao(c: Cartao): void {
    if (c.principal && this.cartoes.length > 1) {
      this.avisoCartao = 'Escolha outro cartão como principal antes de excluir este.';
      return;
    }
    if (!confirm(`Excluir o cartão ${c.bandeira} final ${c.final}?`)) return;
    this.cartoes = this.cartoes.filter((x) => x.id !== c.id);
    this.salvarCartoes();
    this.avisoCartao = 'Cartão excluído.';
  }

  // ---------- Termos ----------
  abaTermos: 'termos' | 'privacidade' = 'termos';
  readonly atualizadoEm = '16 nov 2026';

  readonly textos = {
    termos: [
      { titulo: '1. Aceitação', texto: 'Ao criar uma conta na PetVitaliz, você concorda com estes Termos de Uso e com a Política de Privacidade. Se não concordar, não use os serviços.' },
      { titulo: '2. Planos e pagamentos', texto: 'Cada plano é vinculado a um pet. A cobrança é feita no cartão de crédito cadastrado. Com o pagamento aprovado, o plano é ativado na hora. No plano anual, o valor total dos 12 meses é cobrado de uma vez.' },
      { titulo: '3. Cotas e serviços', texto: 'Cada benefício tem uma cota mensal, que renova no dia 1º. Serviços fora do plano do pet não podem ser agendados até que ele mude para um plano que os inclua.' },
      { titulo: '4. Agendamentos', texto: 'Consultas e serviços podem ser reagendados ou cancelados até 24 horas antes do horário. Cancelando dentro desse prazo, a cota não é consumida. O profissional é definido pela clínica.' },
      { titulo: '5. Mudança e cancelamento de plano', texto: 'Mudar para um plano maior vale na hora, cobrando a diferença proporcional. Mudar para um plano menor vale na próxima renovação. Ao cancelar, o acesso continua até o fim do ciclo já pago.' },
      { titulo: '6. Pets e conta', texto: 'Um pet com plano ativo não pode ser excluído antes do cancelamento do plano. Ao excluir a conta, os planos são cancelados e os dados são apagados.' }
    ],
    privacidade: [
      { titulo: '1. Quais dados coletamos', texto: 'Nome, e-mail, telefone, data de nascimento e CPF que você informar; dados dos seus pets; histórico de agendamentos; e os 4 últimos números dos cartões. O número completo do cartão não fica salvo.' },
      { titulo: '2. Para que usamos', texto: 'Para ativar e cobrar os planos, agendar serviços, enviar lembretes de consultas e vacinas e falar com você pelo suporte.' },
      { titulo: '3. Com quem compartilhamos', texto: 'Com as clínicas e parceiros da rede credenciada, só o necessário para realizar o atendimento do seu pet, e com o processador de pagamentos.' },
      { titulo: '4. Notificações', texto: 'Você escolhe quais avisos recebe em Minha conta › Notificações e pode desligar as ofertas a qualquer momento.' },
      { titulo: '5. Seus direitos (LGPD)', texto: 'Você pode ver, corrigir ou apagar seus dados. Seus dados aparecem em Minha conta › Dados pessoais, e a exclusão da conta é feita em Minha conta › Segurança.' }
    ]
  };

  // ---------- Sair ----------
  sair(): void {
    this.sairService.pedir();
  }

  // ---------- Editar dados pessoais ----------

  comecarEdicao(): void {
    const partes = this.perfil.nome.trim().split(/\s+/);
    this.edicao = {
      nome: this.bruto.nome || partes[0] || '',
      sobrenome: this.bruto.nome ? this.bruto.sobrenome : partes.slice(1).join(' '),
      telefone: this.mascaraTelefone(this.perfil.telefone),
      nascimento: this.bruto.nascimentoIso
    };
    this.erroDados = '';
    this.okDados = '';
    this.editando = true;
  }

  mascaraTelefone(valor: string): string {
    const d = String(valor || '').replace(/\D/g, '').slice(0, 11);
    if (d.length <= 2) return d.length ? `(${d}` : '';
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  }

  salvarDados(): void {
    const e = this.edicao;
    const tel = e.telefone.replace(/\D/g, '');
    if (!e.nome.trim()) { this.erroDados = 'Informe seu nome.'; return; }
    if (tel && tel.length < 10) { this.erroDados = 'Telefone incompleto. Use DDD + número.'; return; }
    if (e.nascimento && e.nascimento > this.hojeIso) { this.erroDados = 'A data de nascimento não pode ser no futuro.'; return; }

    const payload = {
      nome: e.nome.trim(),
      sobrenome: e.sobrenome.trim(),
      email: this.perfil.email,
      telefone: tel || null,
      data_nascimento: e.nascimento || null
    };

    this.salvandoDados = true;
    this.erroDados = '';
    this.okDados = '';

    this.http.put<any>(`${environment.apiUrl}/user/perfil-dados/atualizar`, payload, { withCredentials: true }).subscribe({
      next: (res) => {
        this.salvandoDados = false;
        this.editando = false;
        this.bruto = { nome: payload.nome, sobrenome: payload.sobrenome, nascimentoIso: e.nascimento || this.bruto.nascimentoIso };
        this.perfil.nome = [payload.nome, payload.sobrenome].filter(Boolean).join(' ');
        if (tel) this.perfil.telefone = tel;
        if (e.nascimento) this.perfil.nascimento = e.nascimento.split('-').reverse().join('/');
        this.okDados = res?.mensagem || 'Dados atualizados.';
        try {
          const u = JSON.parse(localStorage.getItem('usuarioLogado') || '{}');
          localStorage.setItem('usuarioLogado', JSON.stringify({ ...u, nome: this.perfil.nome }));
        } catch { /* sem armazenamento */ }
      },
      error: (err) => {
        this.salvandoDados = false;
        this.erroDados = err.error?.mensagem || 'Não foi possível salvar. Tente de novo.';
      }
    });
  }
}
