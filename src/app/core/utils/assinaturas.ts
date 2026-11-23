// Dados da assinatura que o servidor ainda não guarda (ciclo, forma de pagamento, faturas).
// Ficam neste navegador, por cliente e por pet — igual ao app mobile, que também guarda localmente.

export interface Fatura {
  id: string;
  data: string;        // ISO
  valor: number;
  descricao: string;
  metodo: string;
  status: 'paga' | 'em aberto';
}

export interface Assinatura {
  idPet: number;
  idProduto: number;
  plano: string;
  ciclo: 'mensal' | 'anual';
  metodo: 'cartao' | 'pix' | 'boleto';
  cartaoFinal?: string;
  bandeira?: string;
  inicio: string;      // ISO
  faturas: Fatura[];
  // Cancelamento pedido: o plano segue ativo até o fim do período já pago
  cancelamento?: { pedidoEm: string; em: string; excluirPet: boolean };
}

function chave(): string {
  try {
    const u = JSON.parse(localStorage.getItem('usuarioLogado') || 'null');
    return `assinaturasPetVitaliz:${u?.email || 'cliente'}`;
  } catch {
    return 'assinaturasPetVitaliz:cliente';
  }
}

export function lerAssinaturas(): Record<number, Assinatura> {
  try {
    return JSON.parse(localStorage.getItem(chave()) || '{}');
  } catch {
    return {};
  }
}

export function lerAssinatura(idPet: number): Assinatura | null {
  return lerAssinaturas()[idPet] || null;
}

export function salvarAssinatura(a: Assinatura): void {
  const todas = lerAssinaturas();
  todas[a.idPet] = a;
  localStorage.setItem(chave(), JSON.stringify(todas));
}

export function removerAssinatura(idPet: number): void {
  const todas = lerAssinaturas();
  delete todas[idPet];
  localStorage.setItem(chave(), JSON.stringify(todas));
}

// Registra a contratação (ou troca) com a primeira fatura já paga
export function registrarContratacao(dados: Omit<Assinatura, 'inicio' | 'faturas'> & { valorPago: number }): void {
  const anterior = lerAssinatura(dados.idPet);
  const agora = new Date().toISOString();
  const nomeMetodo = dados.metodo === 'pix' ? 'Pix' : dados.metodo === 'boleto' ? 'Boleto'
    : `Cartão${dados.cartaoFinal ? ' final ' + dados.cartaoFinal : ''}`;
  const { valorPago, ...resto } = dados;
  salvarAssinatura({
    ...resto,
    inicio: agora,
    faturas: [
      {
        id: String(Date.now()),
        data: agora,
        valor: valorPago,
        descricao: `${dados.plano} · ${dados.ciclo === 'anual' ? 'anual' : 'mensal'}`,
        metodo: nomeMetodo,
        status: 'paga'
      },
      ...(anterior?.faturas || [])
    ]
  });
}

export function proximaCobranca(a: Assinatura): Date {
  const d = new Date(a.inicio);
  if (a.ciclo === 'anual') d.setFullYear(d.getFullYear() + 1);
  else d.setMonth(d.getMonth() + 1);
  return d;
}

// ---------- Período pago e cancelamento ----------

const DIA = 86400000;

// Fim do período já pago (igual à data da próxima cobrança)
export function fimDoPeriodo(a: Assinatura): Date {
  return a.cancelamento ? new Date(a.cancelamento.em) : proximaCobranca(a);
}

export function diasRestantes(a: Assinatura, hoje = new Date()): number {
  const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()).getTime();
  const fim = fimDoPeriodo(a);
  const diaFim = new Date(fim.getFullYear(), fim.getMonth(), fim.getDate()).getTime();
  return Math.max(0, Math.round((diaFim - inicioHoje) / DIA));
}

export function textoDias(n: number): string {
  return n === 0 ? 'termina hoje' : n === 1 ? 'falta 1 dia' : `faltam ${n} dias`;
}

// Plano contratado antes deste registro existir: assume ciclo mensal começando hoje
export function garantirAssinatura(idPet: number, plano: { id_produto?: number; nome: string }): Assinatura {
  const atual = lerAssinatura(idPet);
  if (atual) return atual;
  const nova: Assinatura = {
    idPet,
    idProduto: Number(plano.id_produto) || 0,
    plano: plano.nome,
    ciclo: 'mensal',
    metodo: 'cartao',
    inicio: new Date().toISOString(),
    faturas: []
  };
  salvarAssinatura(nova);
  return nova;
}

export function agendarCancelamento(idPet: number, plano: { id_produto?: number; nome: string }, excluirPet: boolean): Assinatura {
  const a = garantirAssinatura(idPet, plano);
  a.cancelamento = {
    pedidoEm: new Date().toISOString(),
    em: (a.cancelamento ? new Date(a.cancelamento.em) : proximaCobranca(a)).toISOString(),
    excluirPet: excluirPet || !!a.cancelamento?.excluirPet
  };
  delete (a as any).trocaAgendada;
  delete (a as any).proximoCiclo;
  salvarAssinatura(a);
  return a;
}

export function desfazerCancelamento(idPet: number): void {
  const a = lerAssinatura(idPet);
  if (!a?.cancelamento) return;
  delete a.cancelamento;
  salvarAssinatura(a);
}

// Pets marcados para exclusão (saem junto com o plano no fim do período)
export function petsParaExcluir(): Record<number, Date> {
  const r: Record<number, Date> = {};
  Object.values(lerAssinaturas()).forEach((a) => {
    if (a.cancelamento?.excluirPet) r[a.idPet] = new Date(a.cancelamento.em);
  });
  return r;
}

// Executa no servidor os cancelamentos cujo período já acabou.
// Chame ao abrir Meu plano, Meus pets e Minha conta.
export function processarCancelamentosVencidos(
  http: { delete: (url: string, opcoes: any) => { subscribe: (o: any) => any } },
  apiUrl: string,
  aoTerminar?: () => void
): void {
  const agora = Date.now();
  const vencidos = Object.values(lerAssinaturas()).filter((a) => a.cancelamento && new Date(a.cancelamento.em).getTime() <= agora);
  if (!vencidos.length) return;
  let pendentes = vencidos.length;
  const fim = () => { if (--pendentes === 0) aoTerminar?.(); };
  const opcoes = { withCredentials: true };
  vencidos.forEach((a) => {
    const apagarPet = () => {
      if (!a.cancelamento?.excluirPet) { removerAssinatura(a.idPet); fim(); return; }
      http.delete(`${apiUrl}/user/listar/pet/delete/${a.idPet}`, opcoes).subscribe({
        next: () => { removerAssinatura(a.idPet); fim(); },
        error: () => fim()
      });
    };
    http.delete(`${apiUrl}/user/planos/cancelar/${a.idPet}`, opcoes).subscribe({
      next: () => apagarPet(),
      // Plano já não existe no servidor: segue para o pet
      error: (err: any) => (err?.status === 404 ? apagarPet() : fim())
    });
  });
}
