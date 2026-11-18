export function mensagemDeErro(err: any, padrao: string): string {
  const corpo = err?.error;
  if (typeof corpo === 'string' && corpo.trim()) {
    return corpo;
  }
  if (corpo && typeof corpo === 'object') {
    const mensagem = corpo.mensagem || corpo.message;
    if (typeof mensagem === 'string' && mensagem.trim()) {
      return mensagem;
    }
  }
  return padrao;
}
