import { Injectable } from '@angular/core';

// Guarda o formulário de contato do rodapé, para outras partes do site
// (ex.: "Saiba mais" de um serviço) poderem preenchê-lo antes de rolar até ele.
@Injectable({ providedIn: 'root' })
export class ContatoRapidoService {
  readonly assuntos = ['Agendamento de consulta', 'Dúvidas sobre serviços', 'Planos e valores', 'Adoção', 'Emergência'];

  dados = {
    nome: '',
    email: '',
    assunto: 'Agendamento de consulta',
    mensagem: ''
  };

  preencher(assunto: string, mensagem: string): void {
    this.dados.assunto = assunto;
    this.dados.mensagem = mensagem;
  }

  abrir(): void {
    document.getElementById('contato')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
