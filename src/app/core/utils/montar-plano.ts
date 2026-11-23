import { formatarPreco } from './formato-plano';

// Monta o plano do jeito que o admin salva (mesma regra da home):
// nome "Plano Ouro | OURO | 349.90" (3º pedaço = preço anual por mês) e
// benefícios "Banho e Tosa: 2x/mês; Exames de rotina: 2x/mês; ..."

export const CORES_NIVEL: Record<string, string> = {
  bronze: '#B87333',
  prata: '#A3ADBC',
  ouro: '#E3A912',
  diamante: '#4FB3D9',
  personalizado: '#21479B'
};

// Proporção anual/mensal padrão de cada nível (quando o anual não vem salvo)
const FATOR_ANUAL: Record<string, number> = {
  bronze: 119.9 / 139.9,
  prata: 179.9 / 219.9,
  ouro: 349.9 / 399.9,
  diamante: 549.9 / 649.9
};

export interface PlanoMontado {
  id_produto: number;
  tag: string;
  nome: string;
  nomeCurto: string;
  preco: string;
  descricao: string;
  resumo: string;
  nivel: string;
  cor: string;
  mensal: number;
  anual: number;
  beneficios: { texto: string; quantidade: string }[];
  beneficiosArray: string[];
}

export function montarPlano(p: any): PlanoMontado {
  const partes = String(p?.nome || '').split(' | ');
  const nome = partes[0];
  const texto = `${partes[1] || ''} ${nome}`.toLowerCase();
  const nivel = ['bronze', 'prata', 'ouro', 'diamante'].find((n) => texto.includes(n)) || 'personalizado';

  const mensal = Number(p?.preco) || 0;
  const anualSalvo = Number(String(partes[2] || '').replace(',', '.'));
  const anual = anualSalvo > 0 ? anualSalvo : Math.round(mensal * (FATOR_ANUAL[nivel] ?? 1) * 100) / 100;

  const lista = String(p?.beneficios ?? '').split(/[\n;]+/).map((b) => b.trim()).filter((b) => b.length > 0);
  const beneficios = lista.map((b) => {
    const i = b.lastIndexOf(':');
    return i > 0 ? { texto: b.slice(0, i).trim(), quantidade: b.slice(i + 1).trim() } : { texto: b, quantidade: '' };
  });

  return {
    id_produto: p?.id_produto,
    tag: partes[1] || 'PLANO ATIVO',
    nome,
    nomeCurto: nome.replace(/^Plano\s+/i, ''),
    preco: formatarPreco(p?.preco),
    descricao: p?.descricao || '',
    resumo: p?.descricao || '',
    nivel,
    cor: CORES_NIVEL[nivel],
    mensal,
    anual,
    beneficios,
    beneficiosArray: lista
  };
}

export function economiaAnual(p: { mensal: number; anual: number }): number {
  return p.mensal > 0 && p.anual < p.mensal ? Math.round((1 - p.anual / p.mensal) * 100) : 0;
}

export function moeda(valor: number): string {
  return (valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
