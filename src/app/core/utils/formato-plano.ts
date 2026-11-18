export function formatarPreco(valor: unknown): string {
  const numero = Number(String(valor ?? '').replace(',', '.'));
  if (!Number.isFinite(numero)) return String(valor ?? '');
  return numero.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function nomeDoPlano(nome: unknown): string {
  return String(nome ?? '').split('|')[0].trim();
}
