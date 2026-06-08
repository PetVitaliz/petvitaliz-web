import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-adocao',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './adocao.component.html',
  styleUrl: './adocao.component.css'
})
export class AdocaoComponent {

  imgPetsAdocao = 'assets/img/adocao-pets.png';
  imgPataAdocao = '';

  petSelecionado = 0;

  petsAdocao = [
    {
      nome: 'Bella',
      titulo: 'Conheça Bella!',
      descricao: 'Bella é uma Golden Retriever doce e carinhosa que adora carinho e longas caminhadas. Ela é amigável, brincalhona e se dá bem com outros animais de estimação. Bella procura uma família que lhe dê todo o amor e atenção que ela merece.',
      destaque: 'Bella se desenvolve bem em uma casa ativa e adoraria ter um quintal grande para correr.',
      tags: ['Golden Retriever', '3 Anos', 'Female', '26 Kg'],
      imagemPrincipal: '',
      imagemMini1: '',
      imagemMini2: '',
      imagemMini3: ''
    },
    {
      nome: 'Thor',
      titulo: 'Conheça Thor!',
      descricao: 'Thor é um cachorro alegre, protetor e muito companheiro. Gosta de brincar, passear e receber atenção.',
      destaque: 'Thor combina com uma família carinhosa e que goste de passeios ao ar livre.',
      tags: ['Vira-lata', '2 Anos', 'Male', '18 Kg'],
      imagemPrincipal: '',
      imagemMini1: '',
      imagemMini2: '',
      imagemMini3: ''
    },
    {
      nome: 'Luna',
      titulo: 'Conheça Luna!',
      descricao: 'Luna é uma gatinha tranquila, curiosa e muito carinhosa. Ama lugares confortáveis e companhia.',
      destaque: 'Luna procura um lar calmo, seguro e cheio de carinho.',
      tags: ['Gata', '1 Ano', 'Female', '4 Kg'],
      imagemPrincipal: '',
      imagemMini1: '',
      imagemMini2: '',
      imagemMini3: ''
    }
  ];

  petAnterior(): void {
    if (this.petSelecionado === 0) {
      this.petSelecionado = this.petsAdocao.length - 1;
    } else {
      this.petSelecionado--;
    }
  }

  proximoPet(): void {
    if (this.petSelecionado === this.petsAdocao.length - 1) {
      this.petSelecionado = 0;
    } else {
      this.petSelecionado++;
    }
  }

  imgPataPassos = '';

  passosAdocao = [
    {
      passo: 'Passo 1',
      titulo: 'Navegue pelo perfis de nossos Pets',
      imagem: ''
    },
    {
      passo: 'Passo 2',
      titulo: 'Visite Nossas Instalações',
      imagem: ''
    },
    {
      passo: 'Passo 3',
      titulo: 'Fazer perguntas',
      imagem: ''
    },
    {
      passo: 'Passo 4',
      titulo: 'Enviar um pedido de adoção',
      imagem: ''
    },
    {
      passo: 'Passo 5',
      titulo: 'Visita domiciliar',
      imagem: ''
    },
    {
      passo: 'Passo 6',
      titulo: 'Taxa de adoção',
      imagem: ''
    },
    {
      passo: 'Passo 7',
      titulo: 'Finalizar a Adoção',
      imagem: ''
    },
    {
      passo: 'Passo 8',
      titulo: 'Apoio Pós-Adoção',
      imagem: ''
    }
  ];
}