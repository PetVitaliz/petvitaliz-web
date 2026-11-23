import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { PlanoMontado, moeda } from '../../core/utils/montar-plano';
import { Assinatura, agendarCancelamento, desfazerCancelamento, diasRestantes, fimDoPeriodo, garantirAssinatura, lerAssinatura, proximaCobranca, registrarContratacao, removerAssinatura, salvarAssinatura, textoDias } from '../../core/utils/assinaturas';
import { PagamentoPendenteComponent } from '../pagamento-pendente/pagamento-pendente.component';

type Metodo = 'cartao' | 'pix' | 'boleto';

// Janelas "Gerenciar assinatura" e "Mudar de plano" (mesmas regras do app):
// - subir de plano vale na hora, pagando a diferença dos dias que faltam no ciclo;
// - descer de plano vale na próxima renovação;
// - troca de ciclo e de forma de pagamento valem na próxima cobrança.
@Component({
  selector: 'app-gerenciar-plano',
  standalone: true,
  imports: [CommonModule, PagamentoPendenteComponent],
  templateUrl: './gerenciar-plano.component.html',
  styleUrl: './gerenciar-plano.component.css'
})
export class GerenciarPlanoComponent implements OnInit {
  @Input() modo: 'gerenciar' | 'mudar' = 'gerenciar';
  @Input() pet: { id_pet: number; nome: string } = { id_pet: 0, nome: '' };
  @Input() plano!: PlanoMontado;
  @Input() planos: PlanoMontado[] = [];
  @Output() fechar = new EventEmitter<void>();
  @Output() alterado = new EventEmitter<string>();

  assinatura: Assinatura | null = null;
  confirmandoCancelamento = false;
  processando = false;
  erro = '';

  // mudar de plano
  escolhido: PlanoMontado | null = null;
  pagandoDiferenca = false;

  readonly moeda = moeda;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.assinatura = garantirAssinatura(this.pet.id_pet, { id_produto: this.plano.id_produto, nome: this.plano.nome });
  }

  // ---------- Assinatura ----------

  get ciclo(): 'mensal' | 'anual' {
    return this.assinatura?.ciclo || 'mensal';
  }

  get proxima(): Date {
    return this.assinatura ? proximaCobranca(this.assinatura) : new Date();
  }

  precoCiclo(p: PlanoMontado, ciclo = this.ciclo): number {
    return ciclo === 'anual' ? p.anual * 12 : p.mensal;
  }

  nomeMetodo(m: Metodo, final?: string): string {
    return m === 'pix' ? 'Pix' : m === 'boleto' ? 'Boleto' : `Cartão de crédito${final ? ' · final ' + final : ''}`;
  }

  get metodoProxima(): Metodo {
    return ((this.assinatura as any)?.proximoMetodo || this.assinatura?.metodo || 'cartao') as Metodo;
  }

  get cicloProximo(): 'mensal' | 'anual' {
    return (this.assinatura as any)?.proximoCiclo || this.ciclo;
  }

  get trocaAgendada(): { nome: string } | null {
    return (this.assinatura as any)?.trocaAgendada || null;
  }

  alterarMetodo(m: Metodo): void {
    if (!this.assinatura) return;
    (this.assinatura as any).proximoMetodo = m;
    salvarAssinatura(this.assinatura);
  }

  alterarCiclo(c: 'mensal' | 'anual'): void {
    if (!this.assinatura) return;
    (this.assinatura as any).proximoCiclo = c;
    salvarAssinatura(this.assinatura);
  }

  dataCurta(iso: string | Date): string {
    return new Date(iso).toLocaleDateString('pt-BR');
  }

  // ---------- Cancelar ----------

  get fimPeriodo(): Date {
    return this.assinatura ? fimDoPeriodo(this.assinatura) : new Date();
  }

  get dias(): string {
    return this.assinatura ? textoDias(diasRestantes(this.assinatura)) : '';
  }

  get cancelado(): boolean {
    return !!this.assinatura?.cancelamento;
  }

  // Não renova mais, mas o pet continua usando o plano até o fim do período pago
  cancelar(): void {
    this.assinatura = agendarCancelamento(this.pet.id_pet, { id_produto: this.plano.id_produto, nome: this.plano.nome }, false);
    this.confirmandoCancelamento = false;
    this.alterado.emit(`Cancelamento confirmado. O ${this.plano.nome} de ${this.pet.nome} continua ativo até ${this.dataCurta(this.fimPeriodo)} (${this.dias}) e não será renovado.`);
  }

  manterPlano(): void {
    desfazerCancelamento(this.pet.id_pet);
    this.assinatura = lerAssinatura(this.pet.id_pet);
    this.alterado.emit(`Pronto! O ${this.plano.nome} de ${this.pet.nome} vai continuar renovando normalmente.`);
  }

  // ---------- Mudar de plano ----------

  get outrosPlanos(): PlanoMontado[] {
    return this.planos;
  }

  ehAtual(p: PlanoMontado): boolean {
    return Number(p.id_produto) === Number(this.plano.id_produto);
  }

  ehUpgrade(p: PlanoMontado): boolean {
    return p.mensal > this.plano.mensal;
  }

  // Diferença proporcional aos dias que faltam no ciclo atual
  get diferenca(): number {
    if (!this.escolhido || !this.assinatura) return 0;
    const inicio = new Date(this.assinatura.inicio).getTime();
    const fim = this.proxima.getTime();
    const restante = Math.max(0, Math.min(1, (fim - Date.now()) / Math.max(1, fim - inicio)));
    const dif = (this.precoCiclo(this.escolhido) - this.precoCiclo(this.plano)) * restante;
    return Math.max(0, Math.round(dif * 100) / 100);
  }

  confirmarMudanca(): void {
    const novo = this.escolhido;
    if (!novo || this.ehAtual(novo) || !this.assinatura) return;
    this.erro = '';

    // Descer de plano: agenda para a próxima renovação
    if (!this.ehUpgrade(novo)) {
      (this.assinatura as any).trocaAgendada = { idProduto: novo.id_produto, nome: novo.nome, em: this.proxima.toISOString() };
      salvarAssinatura(this.assinatura);
      this.alterado.emit(`Pronto! ${this.pet.nome} passa para o ${novo.nome} em ${this.dataCurta(this.proxima)}.`);
      return;
    }

    // Subir de plano: paga a diferença (Pix/boleto mostram o código antes)
    if (this.assinatura.metodo !== 'cartao' && this.diferenca > 0) {
      this.pagandoDiferenca = true;
      return;
    }
    this.aplicarUpgrade();
  }

  // O servidor não tem "trocar plano": cancela o atual e ativa o novo
  aplicarUpgrade(): void {
    const novo = this.escolhido!;
    const a = this.assinatura!;
    this.processando = true;
    this.pagandoDiferenca = false;
    const opcoes = { withCredentials: true };
    this.http.delete(`${environment.apiUrl}/user/planos/cancelar/${this.pet.id_pet}`, opcoes).subscribe({
      next: () => {
        this.http.post(`${environment.apiUrl}/user/planos/pagamento`, { id_produto: Number(novo.id_produto), id_pet: this.pet.id_pet }, opcoes).subscribe({
          next: () => {
            const inicio = a.inicio;
            registrarContratacao({
              idPet: this.pet.id_pet,
              idProduto: Number(novo.id_produto),
              plano: novo.nome,
              ciclo: a.ciclo,
              metodo: a.metodo,
              cartaoFinal: a.cartaoFinal,
              bandeira: a.bandeira,
              valorPago: this.diferenca
            });
            // mantém a data de renovação do ciclo atual
            const nova = lerAssinatura(this.pet.id_pet);
            if (nova) { nova.inicio = inicio; salvarAssinatura(nova); }
            this.processando = false;
            this.alterado.emit(`${this.pet.nome} agora está no ${novo.nome}.`);
          },
          error: (err) => {
            this.processando = false;
            this.erro = err.error?.mensagem || 'O plano anterior foi cancelado, mas não conseguimos ativar o novo. Contrate de novo em Meu plano.';
          }
        });
      },
      error: (err) => {
        this.processando = false;
        this.erro = err.error?.mensagem || 'Não foi possível mudar de plano agora.';
      }
    });
  }
}
