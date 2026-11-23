import { Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { getMinimumPlan, PLAN_NAMES, ServiceId } from '../../core/plan-coverage';

/* =========================================================
   Assistente flutuante (canto inferior direito)
   - Botão "voltar ao topo", que aparece depois de rolar a página
   - Chat com o Vitalino, o dog robô da PetVitaliz
   O Vitalino responde por palavras-chave (sem IA e sem back-end) e só fala
   da PetVitaliz: o que não bater com a lista INTENCOES recebe "não tenho a resposta".
   Para mudar ou incluir uma resposta, edite a lista INTENCOES abaixo.
   ========================================================= */

interface Link {
  texto: string;
  rota: string;
  fragment?: string;
  externo?: boolean;
}

interface Mensagem {
  de: 'bot' | 'eu';
  texto: string;
  links?: Link[];
}

interface Intencao {
  id: string;
  palavras: string[];
  responder: (logado: boolean) => Omit<Mensagem, 'de'>;
}

const WHATSAPP = 'https://wa.me/551140028922';

function planoMinimo(servico: ServiceId): string {
  const p = getMinimumPlan(servico);
  return p ? PLAN_NAMES[p] : 'um plano';
}

const INTENCOES: Intencao[] = [
  {
    id: 'emergencia',
    palavras: ['emergencia', 'urgencia', 'urgente', 'socorro', 'sangr', 'envenen', 'atropel', 'convuls', 'nao respira', 'desmai'],
    responder: () => ({
      texto: 'Au! Se for emergência, ligue agora para (11) 4002-8922. O atendimento de urgência funciona 24h e está incluso em todos os planos. 🚨',
      links: [{ texto: 'Ligar agora', rota: 'tel:+551140028922', externo: true }]
    })
  },
  {
    id: 'sobre',
    palavras: ['petvitaliz', 'quem sao voces', 'o que voces fazem', 'servicos', 'o que oferecem'],
    responder: () => ({
      texto: 'A PetVitaliz é uma clínica veterinária com planos de saúde para pets. Oferecemos consultas, vacinação, exames, banho e tosa, leva e busca, emergência 24h e adoção. 🐾',
      links: [{ texto: 'Ver serviços', rota: '/', fragment: 'servicos' }]
    })
  },
  {
    id: 'saudacao',
    palavras: ['oi', 'ola', 'bom dia', 'boa tarde', 'boa noite', 'eai', 'opa', 'hey'],
    responder: () => ({ texto: 'Oi, oi! 🐾 Em que posso te ajudar hoje? Escolha uma opção abaixo ou escreva sua dúvida.' })
  },
  {
    id: 'agendar',
    palavras: ['agendar', 'agenda', 'marcar', 'horario', 'consulta', 'veterinario', 'vet'],
    responder: (logado) => logado
      ? {
          texto: 'Para agendar, escolha o pet, o serviço e o horário. As consultas que você já marcou ficam em "Consultas".',
          links: [{ texto: 'Agendar consulta', rota: '/user/agendamento' }]
        }
      : {
          texto: `Para agendar, entre na sua conta. A consulta está inclusa a partir do ${planoMinimo('consulta')}.`,
          links: [{ texto: 'Entrar', rota: '/login' }, { texto: 'Criar conta', rota: '/cadastro' }]
        }
  },
  {
    id: 'planos',
    palavras: ['plano', 'planos', 'preco', 'valor', 'quanto custa', 'mensalidade', 'assinatura', 'bronze', 'prata', 'ouro', 'diamante', 'cobertura'],
    responder: (logado) => ({
      texto: 'Temos 4 planos: Bronze, Prata, Ouro e Diamante. Todos incluem emergência 24h. Do Prata em diante entra a vacinação, e Ouro e Diamante têm consultas ilimitadas, exames e leva e busca. No plano anual você economiza.',
      links: logado
        ? [{ texto: 'Meu plano', rota: '/user/meu-plano' }, { texto: 'Contratar plano', rota: '/user/contratar-plano' }]
        : [{ texto: 'Ver planos', rota: '/', fragment: 'planos' }]
    })
  },
  {
    id: 'vacina',
    palavras: ['vacina', 'vacinacao', 'vermifugo', 'raiva', 'v10', 'v8', 'v4', 'v5'],
    responder: () => ({
      texto: `Vacinas anuais e reforços estão inclusos a partir do ${planoMinimo('vacinacao')}. O histórico fica salvo na carteirinha digital do pet. 💉`
    })
  },
  {
    id: 'banho',
    palavras: ['banho', 'tosa', 'higiene', 'unha', 'cheiroso'],
    responder: () => ({
      texto: `Banho e tosa está em todos os planos, a partir do ${planoMinimo('banho_tosa')}. Sem plano, o banho para porte pequeno (até 9 kg) sai a partir de R$ 40. 🛁`,
      links: [{ texto: 'Ver serviços', rota: '/', fragment: 'servicos' }]
    })
  },
  {
    id: 'exames',
    palavras: ['exame', 'exames', 'check-up', 'checkup', 'laboratorio'],
    responder: () => ({ texto: `Exames de rotina e laboratoriais estão inclusos a partir do ${planoMinimo('exames')}. 🔬` })
  },
  {
    id: 'leva_busca',
    palavras: ['leva e busca', 'leva e traz', 'transporte do pet', 'buscar meu pet', 'buscar o pet', 'taxi pet'],
    responder: () => ({ texto: `O leva e busca do pet está incluso a partir do ${planoMinimo('leva_busca')}. 🚐` })
  },
  {
    id: 'pets',
    palavras: ['meu pet', 'meus pets', 'cadastrar pet', 'cadastrar meu', 'carteirinha'],
    responder: (logado) => logado
      ? { texto: 'Seus pets e as carteirinhas ficam em "Meus pets". Por lá você também cadastra um pet novo.', links: [{ texto: 'Meus pets', rota: '/user/listar/pet' }] }
      : { texto: 'Para cadastrar seu pet, crie uma conta. É grátis!', links: [{ texto: 'Criar conta', rota: '/cadastro' }] }
  },
  {
    id: 'adocao',
    palavras: ['adotar', 'adocao', 'adote', 'abrigo', 'filhote'],
    responder: () => ({
      texto: 'Que lindo! 🥹 Temos cães e gatos esperando um lar. Dá uma olhada:',
      links: [{ texto: 'Ver pets para adoção', rota: '/', fragment: 'adocao' }]
    })
  },
  {
    id: 'horario',
    palavras: ['horario de funcionamento', 'que horas abre', 'que horas fecha', 'aberto hoje', 'aberta hoje', 'endereco', 'onde fica', 'onde voces ficam', 'localizacao'],
    responder: () => ({
      texto: 'Ficamos na Av. Paulista, 1000, Bela Vista, São Paulo. Funcionamos de segunda a sexta, das 8h às 20h, e aos sábados e domingos, das 9h às 20h. A emergência é 24h.'
    })
  },
  {
    id: 'senha',
    palavras: ['senha', 'esqueci', 'login', 'entrar', 'acessar'],
    responder: () => ({
      texto: 'Se esqueceu a senha, posso te levar para a tela de recuperação:',
      links: [{ texto: 'Recuperar senha', rota: '/esqueci-senha' }, { texto: 'Entrar', rota: '/login' }]
    })
  },
  {
    id: 'contato',
    palavras: ['contato', 'telefone', 'whatsapp', 'email', 'atendente', 'atendimento humano', 'falar com'],
    responder: () => ({
      texto: 'Você fala com a equipe pelo WhatsApp ou pelo telefone (11) 4002-8922. O e-mail é equipepetvitaliz@gmail.com.',
      links: [{ texto: 'Abrir WhatsApp', rota: WHATSAPP, externo: true }]
    })
  },
  {
    id: 'obrigado',
    palavras: ['obrigad', 'valeu', 'brigad'],
    responder: () => ({ texto: 'Imagina! Abanando o rabo aqui. 🐶 Precisando, é só chamar.' })
  }
];

const SUGESTOES = ['Agendar consulta', 'Planos', 'Banho e tosa', 'Emergência', 'Falar com atendente'];

function normalizar(t: string): string {
  return t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

@Component({
  selector: 'app-assistente',
  standalone: true,
  imports: [FormsModule, NgTemplateOutlet],
  templateUrl: './assistente.component.html',
  styleUrl: './assistente.component.css'
})
export class AssistenteComponent {
  /** true na área do cliente (/user): respostas apontam para as telas logadas */
  @Input() logado = false;

  @ViewChild('lista') lista?: ElementRef<HTMLElement>;
  @ViewChild('campo') campo?: ElementRef<HTMLInputElement>;

  mostrarTopo = false;
  aberto = false;
  digitando = false;
  naoLidas = 0;
  texto = '';
  readonly sugestoes = SUGESTOES;

  mensagens: Mensagem[] = [
    { de: 'bot', texto: 'Au au! Eu sou o Vitalino, o dog robô da PetVitaliz. 🤖🐾 Posso te ajudar com planos, agendamentos, serviços e mais.' }
  ];

  constructor(private router: Router) {}

  @HostListener('window:scroll')
  aoRolar(): void {
    this.mostrarTopo = window.scrollY > 400;
  }

  @HostListener('document:keydown.escape')
  aoEsc(): void {
    if (this.aberto) this.fechar();
  }

  voltarAoTopo(): void {
    const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduzir ? 'auto' : 'smooth' });
  }

  alternar(): void {
    this.aberto ? this.fechar() : this.abrir();
  }

  abrir(): void {
    this.aberto = true;
    // O botão do VLibras fica por cima de tudo: esconde enquanto o chat está aberto (ver styles.css)
    document.body.classList.add('chat-vitalino-aberto');
    this.naoLidas = 0;
    this.rolarParaFim();
    setTimeout(() => this.campo?.nativeElement.focus(), 150);
  }

  fechar(): void {
    this.aberto = false;
    document.body.classList.remove('chat-vitalino-aberto');
  }

  enviar(textoLivre?: string): void {
    const t = (textoLivre ?? this.texto).trim();
    if (!t || this.digitando) return;
    this.mensagens.push({ de: 'eu', texto: t });
    this.texto = '';
    this.digitando = true;
    this.rolarParaFim();

    const resposta = this.responder(t);
    setTimeout(() => {
      this.digitando = false;
      this.mensagens.push({ de: 'bot', ...resposta });
      if (!this.aberto) this.naoLidas++;
      this.rolarParaFim();
    }, 600 + Math.min(resposta.texto.length * 8, 900));
  }

  abrirLink(l: Link): void {
    if (l.externo) {
      window.open(l.rota, l.rota.startsWith('tel:') ? '_self' : '_blank', 'noopener');
      return;
    }
    this.router.navigate([l.rota], l.fragment ? { fragment: l.fragment } : {});
    // No celular o chat cobre a tela: fecha para mostrar a página
    if (window.innerWidth < 620) this.fechar();
  }

  private responder(t: string): Omit<Mensagem, 'de'> {
    const n = ` ${normalizar(t)} `;
    // A intenção com mais palavras encontradas ganha; emergência tem prioridade
    let melhor: Intencao | null = null;
    let pontos = 0;
    for (const i of INTENCOES) {
      const p = i.palavras.filter(w => n.includes(w.length <= 3 ? ` ${w} ` : w)).length;
      if (p > 0 && i.id === 'emergencia') return i.responder(this.logado);
      if (p > pontos) { melhor = i; pontos = p; }
    }
    if (melhor) return melhor.responder(this.logado);
    return {
      texto: 'Desculpe, não tenho a resposta para isso. 🐕‍🦺 Eu só respondo dúvidas sobre a PetVitaliz e o que ela oferece: planos, consultas, vacinação, exames, banho e tosa, leva e busca, emergência, adoção e a sua conta.'
    };
  }

  private rolarParaFim(): void {
    setTimeout(() => {
      const el = this.lista?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }
}
