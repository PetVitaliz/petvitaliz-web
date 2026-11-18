import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface Pergunta {
  categoria: string;
  pergunta: string;
  resposta: string;
  link?: { rotulo: string; rota: string; queryParams?: Record<string, string> };
}

/**
 * E-mail que recebe os relatos de problema.
 * TROQUE pelo e-mail real do suporte / administração da clínica.
 */
const EMAIL_SUPORTE = 'suporte@petvitaliz.com';

@Component({
  selector: 'app-ajuda-funcionario',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './ajuda-funcionario.component.html',
  styleUrl: './ajuda-funcionario.component.css'
})
export class AjudaFuncionarioComponent {

  readonly emailSuporte = EMAIL_SUPORTE;

  termoBusca = '';
  categoriaSelecionada = 'Todas';
  abertas = new Set<number>();

  readonly categorias = ['Todas', 'Atendimentos', 'Ponto e carga', 'Clientes e pets', 'Conta e acesso'];

  readonly perguntas: Pergunta[] = [
    {
      categoria: 'Atendimentos',
      pergunta: 'Por que não consigo iniciar um atendimento?',
      resposta: 'O sistema só deixa iniciar a consulta a partir do horário agendado. Se tentar antes, aparece o aviso "fora da janela de alteração permitida". Confira o horário na sua agenda e tente de novo no horário marcado.',
      link: { rotulo: 'Abrir minha agenda', rota: '/funcionario/consultas' }
    },
    {
      categoria: 'Atendimentos',
      pergunta: 'Até quando posso concluir uma consulta?',
      resposta: 'A conclusão fica liberada a partir do horário de término da consulta e por até 10 minutos depois dele. Passado esse prazo, a consulta aparece como "Atrasada" e o sistema pode recusar a mudança. Nesse caso, relate o problema para o administrador ajustar.'
    },
    {
      categoria: 'Atendimentos',
      pergunta: 'O que significa cada status da consulta?',
      resposta: 'Em espera: o paciente está aguardando o atendimento. Em atendimento: você já iniciou a consulta. Atrasada: a consulta foi iniciada e passou do horário de término sem ser concluída. Finalizada: o atendimento foi concluído.'
    },
    {
      categoria: 'Atendimentos',
      pergunta: 'Onde vejo a ficha e as queixas do paciente?',
      resposta: 'No Painel ou em Minha agenda, clique na consulta (ou no botão "Prontuário" / "Ficha"). A ficha mostra o tutor, o horário, o procedimento e as observações enviadas pelo tutor no agendamento.',
      link: { rotulo: 'Abrir minha agenda', rota: '/funcionario/consultas' }
    },
    {
      categoria: 'Ponto e carga',
      pergunta: 'Para que serve o botão "Bater ponto"?',
      resposta: 'Ele registra o seu ponto e restaura a sua carga de atendimentos do dia. Use no início do expediente. O botão fica no topo do Painel.',
      link: { rotulo: 'Ir para o painel', rota: '/funcionario/home' }
    },
    {
      categoria: 'Ponto e carga',
      pergunta: 'O que é a "carga disponível"?',
      resposta: 'É quantos atendimentos você ainda pode receber no dia. Ela aparece no Painel e é restaurada quando você bate o ponto.'
    },
    {
      categoria: 'Clientes e pets',
      pergunta: 'Como encontro os pets de um tutor?',
      resposta: 'Em "Clientes e pets", na aba Tutores, clique em "Ver pets" na linha do tutor. A aba Pets abre já filtrada com os animais dele. Também dá para buscar pelo nome do pet, da espécie ou da raça.',
      link: { rotulo: 'Abrir clientes e pets', rota: '/funcionario/clientes' }
    },
    {
      categoria: 'Clientes e pets',
      pergunta: 'Posso cadastrar um pet novo?',
      resposta: 'Não. O cadastro de pets é feito pelo próprio tutor, na conta dele, para garantir o vínculo correto. Se o tutor estiver com dificuldade, oriente-o a cadastrar o pet pela área de pets da conta dele no site.'
    },
    {
      categoria: 'Clientes e pets',
      pergunta: 'Um tutor está como "Inativo". O que fazer?',
      resposta: 'Contas inativas não podem receber agendamentos. A reativação é feita pelo administrador. Use o formulário desta página para avisar.'
    },
    {
      categoria: 'Conta e acesso',
      pergunta: 'Esqueci minha senha. Como recupero?',
      resposta: 'As contas de funcionário são criadas pelo administrador da clínica. Peça a ele uma nova senha usando o formulário desta página ou pessoalmente. O seu e-mail de acesso termina em @petvitalizfuncionario.com.'
    },
    {
      categoria: 'Conta e acesso',
      pergunta: 'Como altero meus dados ou minha foto?',
      resposta: 'Em "Meu perfil" você pode editar nome, sobrenome, telefone e foto. O e-mail de acesso só pode ser alterado pelo administrador.',
      link: { rotulo: 'Abrir meu perfil', rota: '/funcionario/perfil' }
    },
    {
      categoria: 'Conta e acesso',
      pergunta: 'O sistema me mandou para a tela de login. O que fazer?',
      resposta: 'Entre de novo com seu e-mail e senha. Se isso acontecer com frequência ou no meio de um atendimento, relate o problema por esta página.'
    }
  ];

  // ---------- Relatar problema ----------

  readonly tiposProblema = [
    'Erro ao iniciar ou concluir consulta',
    'Agenda ou horários incorretos',
    'Dados de cliente ou pet errados',
    'Problema com ponto ou carga',
    'Acesso, senha ou login',
    'Outro'
  ];

  relato = {
    tipo: this.tiposProblema[0],
    urgencia: 'normal',
    descricao: ''
  };

  erroRelato = '';
  relatoPronto = false;
  copiado = false;

  // ---------- FAQ ----------

  get perguntasFiltradas(): Pergunta[] {
    const termo = this.termoBusca.trim().toLowerCase();
    return this.perguntas.filter(p => {
      const matchCategoria = this.categoriaSelecionada === 'Todas' || p.categoria === this.categoriaSelecionada;
      const matchTermo = !termo || p.pergunta.toLowerCase().includes(termo) || p.resposta.toLowerCase().includes(termo);
      return matchCategoria && matchTermo;
    });
  }

  contarCategoria(categoria: string): number {
    return categoria === 'Todas' ? this.perguntas.length : this.perguntas.filter(p => p.categoria === categoria).length;
  }

  definirCategoria(categoria: string): void {
    this.categoriaSelecionada = categoria;
    this.abertas.clear();
  }

  alternar(pergunta: Pergunta): void {
    const indice = this.perguntas.indexOf(pergunta);
    if (this.abertas.has(indice)) this.abertas.delete(indice);
    else this.abertas.add(indice);
  }

  estaAberta(pergunta: Pergunta): boolean {
    return this.abertas.has(this.perguntas.indexOf(pergunta));
  }

  limparBusca(): void {
    this.termoBusca = '';
    this.categoriaSelecionada = 'Todas';
  }

  // ---------- Relato ----------

  irParaRelato(): void {
    document.getElementById('relatar')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => document.getElementById('relato-descricao')?.focus(), 400);
  }

  private get usuarioLogado(): { nome?: string; email?: string } {
    try {
      return JSON.parse(localStorage.getItem('usuarioLogado') || '{}');
    } catch {
      return {};
    }
  }

  get textoRelato(): string {
    const usuario = this.usuarioLogado;
    const agora = new Date().toLocaleString('pt-BR');
    return [
      `Tipo: ${this.relato.tipo}`,
      `Urgência: ${this.relato.urgencia === 'alta' ? 'Alta (está travando o atendimento)' : 'Normal'}`,
      '',
      'O que aconteceu:',
      this.relato.descricao.trim(),
      '',
      '---',
      `Funcionário: ${usuario.nome || 'não identificado'} (${usuario.email || 'sem e-mail'})`,
      `Data e hora: ${agora}`,
      `Navegador: ${navigator.userAgent}`
    ].join('\n');
  }

  get assuntoRelato(): string {
    const prefixo = this.relato.urgencia === 'alta' ? '[URGENTE] ' : '';
    return `${prefixo}Suporte PetVitaliz — ${this.relato.tipo}`;
  }

  get linkEmail(): string {
    return `mailto:${this.emailSuporte}?subject=${encodeURIComponent(this.assuntoRelato)}&body=${encodeURIComponent(this.textoRelato)}`;
  }

  prepararRelato(): void {
    this.copiado = false;
    if (this.relato.descricao.trim().length < 10) {
      this.erroRelato = 'Descreva o problema com um pouco mais de detalhe (pelo menos 10 caracteres).';
      this.relatoPronto = false;
      return;
    }
    this.erroRelato = '';
    this.relatoPronto = true;
  }

  copiarRelato(): void {
    const texto = `${this.assuntoRelato}\n\n${this.textoRelato}`;
    navigator.clipboard?.writeText(texto).then(
      () => (this.copiado = true),
      () => (this.erroRelato = 'Não foi possível copiar automaticamente. Selecione o texto e copie manualmente.')
    );
  }

  novoRelato(): void {
    this.relato = { tipo: this.tiposProblema[0], urgencia: 'normal', descricao: '' };
    this.relatoPronto = false;
    this.copiado = false;
    this.erroRelato = '';
  }
}
