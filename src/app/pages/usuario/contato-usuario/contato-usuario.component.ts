import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { catchError, of } from 'rxjs';
import { mensagemDeErro } from '../../../core/utils/mensagem-erro';
import { environment } from '../../../environments/environment';

type Categoria = 'todas' | 'plano' | 'pagamentos' | 'consultas' | 'pet' | 'conta';

interface Pergunta {
  categoria: Exclude<Categoria, 'todas'>;
  pergunta: string;
  resposta: string;
}

// Mesmas perguntas da tela de ajuda do app mobile
const FAQ: Pergunta[] = [
  { categoria: 'plano', pergunta: 'O plano vale para todos os meus pets?', resposta: 'Não. Cada plano é de um pet. Se você tem mais de um, escolha um plano para cada um em Meu plano.' },
  { categoria: 'plano', pergunta: 'Como mudo de plano?', resposta: 'Em Meu plano, clique em "Mudar de plano". Para um plano maior, a mudança vale na hora e você paga só a diferença. Para um menor, ela acontece na próxima renovação.' },
  { categoria: 'plano', pergunta: 'Se eu cancelar, perco os benefícios na hora?', resposta: 'Não. Você continua usando o plano até o fim do ciclo já pago. Depois disso, ele não renova.' },
  { categoria: 'plano', pergunta: 'O que acontece quando a cota do mês acaba?', resposta: 'O serviço fica como "Cota esgotada" até o dia 1º do mês seguinte, quando a cota renova.' },
  { categoria: 'pagamentos', pergunta: 'Quais formas de pagamento são aceitas?', resposta: 'Cartão de crédito (em até 12x), Pix e boleto. No cartão, o plano é ativado na hora; no Pix e no boleto, assim que o pagamento é confirmado.' },
  { categoria: 'pagamentos', pergunta: 'O plano anual é mais barato?', resposta: 'Sim. No plano anual o valor por mês é menor e a cobrança é feita de uma vez para os 12 meses.' },
  { categoria: 'pagamentos', pergunta: 'Meu pagamento foi recusado. E agora?', resposta: 'Confira os dados do cartão ou use outra forma de pagamento. Suas escolhas de plano e de pet ficam salvas para tentar de novo.' },
  { categoria: 'consultas', pergunta: 'Até quando posso reagendar ou cancelar?', resposta: 'Até 24 horas antes do horário marcado. Cancelando dentro desse prazo, sua cota não é consumida.' },
  { categoria: 'consultas', pergunta: 'Posso escolher o veterinário?', resposta: 'Nesta versão, a clínica atribui o profissional. O nome aparece nos detalhes da consulta.' },
  { categoria: 'pet', pergunta: 'Como cadastro um pet?', resposta: 'Vá em Meus pets e clique em "Cadastrar pet". São 3 etapas rápidas e o cadastro é gratuito.' },
  { categoria: 'pet', pergunta: 'O que acontece com o plano se eu excluir o pet?', resposta: 'O plano do pet é cancelado junto. Antes de excluir, pedimos a sua confirmação.' },
  { categoria: 'conta', pergunta: 'Como altero meus dados?', resposta: 'Em Minha conta › Dados pessoais, clique em "Editar dados". E-mail e CPF não podem ser alterados.' },
  { categoria: 'conta', pergunta: 'Esqueci minha senha.', resposta: 'Na tela de login, clique em "Esqueci minha senha". Enviamos um código para o seu e-mail.' },
  { categoria: 'conta', pergunta: 'Como excluo minha conta?', resposta: 'Fale com o suporte por aqui ou pelo WhatsApp. Seus planos são cancelados e os dados apagados.' }
];

@Component({
  selector: 'app-contato-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './contato-usuario.component.html',
  styleUrl: './contato-usuario.component.css'
})
export class ContatoUsuarioComponent implements OnInit {

  readonly telefone = '(11) 4002-8922';
  readonly email = 'equipepetvitaliz@gmail.com';
  readonly linkWhatsapp = 'https://wa.me/551140028922';
  readonly linkMapa = 'https://maps.google.com/?q=Av.+Paulista,+1000+-+Bela+Vista,+São+Paulo+-+SP';

  readonly categorias: { id: Categoria; nome: string }[] = [
    { id: 'todas', nome: 'Todas' },
    { id: 'plano', nome: 'Meu plano' },
    { id: 'pagamentos', nome: 'Pagamentos' },
    { id: 'consultas', nome: 'Consultas' },
    { id: 'pet', nome: 'Meu pet' },
    { id: 'conta', nome: 'Conta e acesso' }
  ];
  readonly assuntos = ['Meu plano', 'Pagamentos', 'Consultas', 'Meu pet', 'Conta e acesso', 'Emergência', 'Outro assunto'];

  busca = '';
  categoria: Categoria = 'todas';
  aberta: string | null = FAQ[0].pergunta;

  nome = '';
  emailCliente = '';
  pets: { id_pet: number; nome: string }[] = [];
  contato = { assunto: 'Meu plano', pet: '', mensagem: '' };

  enviando = false;
  enviada = false;
  erro = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    try {
      const u = JSON.parse(localStorage.getItem('usuarioLogado') || 'null');
      if (u) {
        this.nome = `${u.nome || ''} ${u.sobrenome || ''}`.trim();
        this.emailCliente = u.email || '';
      }
    } catch { /* sem dados salvos */ }

    this.http.get<any>(`${environment.apiUrl}/user/listar/pet`, { withCredentials: true })
      .pipe(catchError(() => of(null)))
      .subscribe((r) => {
        this.pets = (r?.pets || r?.Pets || []).map((p: any) => ({ id_pet: p.id_pet, nome: p.nome }));
      });
  }

  get perguntas(): Pergunta[] {
    const termo = this.normalizar(this.busca);
    return FAQ.filter((f) =>
      (this.categoria === 'todas' || f.categoria === this.categoria) &&
      (!termo || this.normalizar(`${f.pergunta} ${f.resposta}`).includes(termo))
    );
  }

  private normalizar(t: string): string {
    return t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
  }

  alternar(p: string): void {
    this.aberta = this.aberta === p ? null : p;
  }

  enviarMensagem(): void {
    this.erro = '';
    this.enviada = false;
    const texto = this.contato.mensagem.trim();
    if (!this.emailCliente) {
      this.erro = 'Não encontramos o e-mail da sua conta. Entre de novo e tente outra vez.';
      return;
    }
    if (texto.length < 6) {
      this.erro = 'Escreva um pouco mais sobre o que aconteceu (pelo menos 6 caracteres).';
      return;
    }

    this.enviando = true;
    const sobrePet = this.contato.pet ? ` | Pet: ${this.contato.pet}` : '';
    const payload = {
      email: this.emailCliente,
      mensagem: `[Assunto: ${this.contato.assunto}${sobrePet}] - ${texto}`
    };

    this.http.post<any>(`${environment.apiUrl}/user/contato`, payload, { withCredentials: true }).subscribe({
      next: () => {
        this.enviando = false;
        this.enviada = true;
        this.contato = { assunto: 'Meu plano', pet: '', mensagem: '' };
      },
      error: (err) => {
        this.enviando = false;
        this.erro = mensagemDeErro(err, 'Não foi possível enviar sua mensagem agora. Tente de novo.');
      }
    });
  }
}
