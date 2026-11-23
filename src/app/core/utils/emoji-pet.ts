// Emoji padrão do pet sem foto, conforme a espécie
const EMOJIS: Record<string, string> = {
  cachorro: '🐶',
  cao: '🐶',
  gato: '🐱',
  ave: '🐦',
  passaro: '🐦',
  coelho: '🐰',
  peixe: '🐟',
  hamster: '🐹',
  tartaruga: '🐢'
};

export function emojiPet(especie?: string | null): string {
  const e = String(especie || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
  return EMOJIS[e] || (e ? '🐹' : '🐶');
}
