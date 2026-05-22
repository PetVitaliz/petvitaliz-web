import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeaderUsuarioComponent } from '../../usuario/header-usuario/header-usuario.component';

type ServicoHome = {
  titulo: string;
  imagem: string;
  tags: string[];
};

@Component({
  selector: 'app-home-usuario',
  standalone: true,
  imports: [RouterLink, HeaderUsuarioComponent],
  templateUrl: './home-usuario.component.html',
  styleUrl: './home-usuario.component.css'
})
export class HomeUsuarioComponent {
  imgGatoAmarelo = 'assets/img/cat.png';
  imgCachorros = 'assets/img/dogs.png';
  imgCachorroCoracao = 'assets/img/dog.png';
  imgGatoDeitado = 'assets/img/gato.png';
  imgPataFundo = 'assets/img/banner.png';
  imgPataPlanos = '';
  imgFinalHome = '';

  servicoSelecionado = 0;

  doutores = [
    {
      nome: 'Dr. 1',
      imagem: '',
      experiencia: '20+ Years Experience'
    },
    {
      nome: 'Dr. 2',
      imagem: '',
      experiencia: '20+ Years Experience'
    },
    {
      nome: 'Dr. 3',
      imagem: '',
      experiencia: '20+ Years Experience'
    },
    {
      nome: 'Dr. 4',
      imagem: '',
      experiencia: '20+ Years Experience'
    }
  ];

  servicosHome: ServicoHome[] = [
    {
      titulo: 'Suprimento de Pet',
      imagem: '',
      tags: ['Brinquedos', 'Acessórios']
    },
    {
      titulo: 'Serviços de Higiene',
      imagem: '',
      tags: ['Corte de Unhas', 'Limpeza de Ouvido']
    },
    {
      titulo: 'Suporte Veterinario',
      imagem: '',
      tags: ['Check-Ups', 'Vacinação']
    },
    {
      titulo: 'Assistencia com Adoção',
      imagem: '',
      tags: ['Abrigos locais', 'Pet Perfeito']
    },
    {
      titulo: 'Hospedagem & Creche Para Pets',
      imagem: '',
      tags: ['Hora de Brincar', 'Alimentação']
    }
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

  selecionarServico(index: number): void {
    this.servicoSelecionado = index;
  }
}