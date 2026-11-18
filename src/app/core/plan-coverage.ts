/* =========================================================
   Cobertura de serviços por plano — mesmas regras do app mobile
   (petvitaliz-mobile/src/data/planCoverage.ts).
   Se mudar uma regra lá, mude aqui também.
   ---------------------------------------------------------
   - Cada pet tem o próprio plano.
   - Serviço que não aparece no plano fica bloqueado.
   - Número = cota por mês; 'ilimitado' = sem limite.
   - A cota renova no dia 1º e consultas canceladas não contam.
   ========================================================= */

export type PlanId = 'bronze' | 'prata' | 'ouro' | 'diamante';

export type ServiceId =
  | 'consulta'
  | 'vacinacao'
  | 'exames'
  | 'emergencia'
  | 'banho_tosa'
  | 'leva_busca';

export type Quota = number | 'ilimitado';

export interface ServiceInfo {
  id: ServiceId;
  nome: string;
  descricao: string;
  /** Tipo de profissional que o back-end espera em POST /agendamento */
  servicoApi: 'veterinario' | 'tosador';
}

export const PLAN_ORDER: PlanId[] = ['bronze', 'prata', 'ouro', 'diamante'];

export const PLAN_NAMES: Record<PlanId, string> = {
  bronze: 'Plano Bronze',
  prata: 'Plano Prata',
  ouro: 'Plano Ouro',
  diamante: 'Plano Diamante'
};

/** Cores dos planos (as mesmas do painel do admin) */
export const PLAN_CORES: Record<PlanId, string> = {
  bronze: '#B87333',
  prata: '#A3ADBC',
  ouro: '#E3A912',
  diamante: '#4FB3D9'
};

export const SERVICES: ServiceInfo[] = [
  { id: 'consulta', nome: 'Consulta', descricao: 'Consulta veterinária presencial', servicoApi: 'veterinario' },
  { id: 'vacinacao', nome: 'Vacinação', descricao: 'Vacinas anuais e reforços', servicoApi: 'veterinario' },
  { id: 'exames', nome: 'Exames', descricao: 'Exames de rotina e laboratoriais', servicoApi: 'veterinario' },
  { id: 'emergencia', nome: 'Emergência 24h', descricao: 'Atendimento de urgência', servicoApi: 'veterinario' },
  { id: 'banho_tosa', nome: 'Banho e tosa', descricao: 'Higiene e estética', servicoApi: 'tosador' },
  { id: 'leva_busca', nome: 'Leva e busca', descricao: 'Transporte do pet', servicoApi: 'veterinario' }
];

export const PLAN_COVERAGE: Record<PlanId, Partial<Record<ServiceId, Quota>>> = {
  bronze: {
    banho_tosa: 1,
    consulta: 1,
    emergencia: 'ilimitado'
  },
  prata: {
    banho_tosa: 1,
    consulta: 2,
    vacinacao: 'ilimitado',
    emergencia: 'ilimitado'
  },
  ouro: {
    banho_tosa: 2,
    exames: 2,
    consulta: 'ilimitado',
    vacinacao: 'ilimitado',
    leva_busca: 2,
    emergencia: 'ilimitado'
  },
  diamante: {
    banho_tosa: 2,
    exames: 2,
    consulta: 'ilimitado',
    vacinacao: 'ilimitado',
    leva_busca: 'ilimitado',
    emergencia: 'ilimitado'
  }
};

/** Converte o nome do plano ("Plano Ouro | OURO | 349.90", "ouro"...) no id. */
export function getPlanId(nomePlano?: string | null): PlanId | null {
  if (!nomePlano) return null;
  const t = String(nomePlano).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  return PLAN_ORDER.find(id => t.includes(id)) ?? null;
}

export function getServiceQuota(planId: PlanId | null, serviceId: ServiceId): Quota | null {
  if (!planId) return null;
  return PLAN_COVERAGE[planId][serviceId] ?? null;
}

/** Plano mais barato que cobre o serviço. */
export function getMinimumPlan(serviceId: ServiceId): PlanId | null {
  return PLAN_ORDER.find(id => PLAN_COVERAGE[id][serviceId] !== undefined) ?? null;
}

export function getService(serviceId: ServiceId): ServiceInfo {
  return SERVICES.find(s => s.id === serviceId) as ServiceInfo;
}

/**
 * Lê o plano de um pet vindo da API.
 * Procura nos campos mais prováveis; o back-end precisa mandar um deles
 * em GET /funcionario/pets (ex.: plano: "Plano Ouro").
 * Se vier hasActivePlan/plano_ativo = false, o pet é tratado como sem plano.
 */
export function planoDoPet(pet: any): PlanId | null {
  if (!pet || typeof pet !== 'object') return null;

  const ativo = pet.hasActivePlan ?? pet.plano_ativo ?? pet.planoAtivo ?? pet.assinatura?.ativa;
  if (ativo === false) return null;

  const candidatos = [
    pet.plano, pet.plan, pet.plano_nome, pet.nome_plano, pet.planoNome,
    pet.plano?.nome, pet.produto?.nome, pet.assinatura?.nome, pet.assinatura?.plano,
    pet.assinatura?.produto?.nome
  ];

  for (const valor of candidatos) {
    if (typeof valor === 'string') {
      const id = getPlanId(valor);
      if (id) return id;
    }
  }
  return null;
}

/** Prefixo gravado nas observações para identificar o serviço da consulta. */
export const PREFIXO_SERVICO = 'Serviço: ';

/**
 * Descobre qual serviço uma consulta da API consumiu.
 * Usa tipo_servico (se o back-end guardar), o prefixo das observações
 * ou, por último, o tipo do profissional.
 */
export function servicoDaConsulta(c: any): ServiceId {
  const tipo = String(c?.tipo_servico || c?.servico_id || '').trim() as ServiceId;
  if (SERVICES.some(s => s.id === tipo)) return tipo;

  const obs = String(c?.observacoes || '');
  if (obs.startsWith(PREFIXO_SERVICO)) {
    const nome = obs.slice(PREFIXO_SERVICO.length).split(/[.\n]/)[0].trim().toLowerCase();
    const achado = SERVICES.find(s => s.nome.toLowerCase() === nome);
    if (achado) return achado.id;
  }

  const servico = String(c?.servico || c?.funcionario?.especialidade || '').toLowerCase();
  if (servico.includes('tos')) return 'banho_tosa';
  return 'consulta';
}