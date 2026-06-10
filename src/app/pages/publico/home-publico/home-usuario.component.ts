import { Component, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { HeaderUsuarioComponent } from '../../usuario/header-usuario/header-usuario.component';

type ServicoHome = {
  titulo: string;
  imagem: string;
  tags: string[];
};

@Component({
  selector: 'app-home-usuario',
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderUsuarioComponent],
  templateUrl: './home-usuario.component.html',
  styleUrl: './home-usuario.component.css'
})
export class HomeUsuarioComponent implements OnInit {
  imgGatoAmarelo = 'assets/img/cat.png';
  imgCachorros = 'assets/img/dogs.png';
  imgCachorroCoracao = 'assets/img/dog.png';
  imgGatoDeitado = 'assets/img/gato.png';
  imgPataFundo = 'assets/img/banner.png';
  imgPataPlanos = '';
  imgFinalHome = 'assets/img/cachorro-feliz.png';

  servicoSelecionado = 0;
  planos: any[] = [];
  carregandoPlanos = true;

  doutores = [
    { nome: 'Dr. Pedro', imagem: 'assets/img/african-doctor.png', experiencia: '10+ Anos de Experiência' },
    { nome: 'Dra. Carla', imagem: 'assets/img/successful-psychologist.png', experiencia: '8+ Anos de Experiência' },
    { nome: 'Dr. Rogério', imagem: 'assets/img/african-doctor2.png', experiencia: '12+ Anos de Experiência' },
    { nome: 'Dra. Ana', imagem: 'assets/img/smiling-african.png', experiencia: '6+ Anos de Experiência' }
  ];

  servicosHome: ServicoHome[] = [
    { titulo: 'Suprimento de Pet', imagem: 'assets/img/carrosel1.png', tags: ['Brinquedos', 'Acessórios'] },
    { titulo: 'Serviços de Higiene', imagem: 'assets/img/carrosel2.png', tags: ['Corte de Unhas', 'Limpeza de Ouvido'] },
    { titulo: 'Suporte Veterinario', imagem: 'assets/img/carrosel3.png', tags: ['Check-Ups', 'Vacinação'] },
    { titulo: 'Assistencia com Adoção', imagem: 'assets/img/carrosel4.png', tags: ['Abrigos locais', 'Pet Perfeito'] },
    { titulo: 'Hospedagem & Creche Para Pets', imagem: 'assets/img/carrosel5.png', tags: ['Hora de Brincar', 'Alimentação'] }
  ];

      
  avaliacoes = [
  {
    nome: 'Anonymous',
    texto: 'Até o momento, este pet shop tem se mostrado o melhor da região em termos de serviços especializados e confiáveis para donos de animais. Sua equipe trabalha com genuíno cuidado e paixão.'
  },
  {
    nome: 'Anonymous',
    texto: 'Até o momento, este pet shop tem se mostrado o melhor da região em termos de serviços especializados e confiáveis para donos de animais. Sua equipe trabalha com genuíno cuidado e paixão.'
  },
  {
    nome: 'Anonymous',
    texto: 'Até o momento, este pet shop tem se mostrado o melhor da região em termos de serviços especializados e confiáveis para donos de animais. Sua equipe trabalha com genuíno cuidado e paixão.'
  },
  {
    nome: 'Anonymous',
    texto: 'Até o momento, este pet shop tem se mostrado o melhor da região em termos de serviços especializados e confiáveis para donos de animais. Sua equipe trabalha com genuíno cuidado e paixão.'
  }
];

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.buscarPlanosCadastrados();
  }

  buscarPlanosCadastrados(): void {
    this.carregandoPlanos = true;

    this.http.get(`${environment.apiUrl}/adm/listar/produtos`, { withCredentials: true }).subscribe({
      next: (response: any) => {
        if (response && response.produtos) {
          this.planos = response.produtos.map((p: any) => {
            const partesNome = p.nome.split(' | ');
            const nomePlano = partesNome[0];

            return {
              id_produto: p.id_produto,
              tag: partesNome[1] || 'PLANO ATIVO',
              nome: nomePlano,
              preco: p.preco,
              descricao: p.descricao,
              beneficiosArray: this.getBeneficiosDoPlano(nomePlano)
            };
          });
        }

        this.carregandoPlanos = false;
      },
      error: (err) => {
        console.error('Erro ao buscar planos:', err);
        this.carregandoPlanos = false;
      }
    });
  }

  getBeneficiosDoPlano(nomePlano: string): string[] {
    if (nomePlano.includes('Inicial')) {
      return [
        'Check-up veterinário básico',
        'Suporte para saúde preventiva',
        'Descontos em consultas e exames',
        'Carteirinha digital do pet',
        'Lembretes de vacinação'
      ];
    }

    if (nomePlano.includes('Essenciais')) {
      return [
        '2 consultas veterinárias mensais',
        'Desconto em vacinas e exames',
        'Prioridade em agendamentos',
        'Teleorientação veterinária',
        'Histórico digital do pet'
      ];
    }

    if (nomePlano.includes('Abrangente')) {
      return [
        '4 consultas veterinárias mensais',
        'Vacinação anual inclusa',
        'Teleorientação veterinária',
        'Exames laboratoriais com desconto',
        'Acompanhamento preventivo'
      ];
    }

    if (nomePlano.includes('Premium')) {
      return [
        'Consultas veterinárias ilimitadas',
        'Descontos máximos em exames e procedimentos',
        'Suporte exclusivo PetVitaliz',
        'Atendimento de emergência',
        'Prioridade máxima em agendamentos'
      ];
    }

    return [];
  }

  inscreverNoPlano(plano: any): void {
    localStorage.setItem('planoSelecionado', JSON.stringify(plano));

    if (this.router.url.includes('/user/home')) {
      this.router.navigate(['/user/contrato-plano']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  selecionarServico(index: number): void {
    this.servicoSelecionado = index;
  }
}