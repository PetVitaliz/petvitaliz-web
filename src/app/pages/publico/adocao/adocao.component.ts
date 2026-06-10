import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthRedirectService } from '../../../core/services/auth-redirect.service';

@Component({
  selector: 'app-adocao',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './adocao.component.html',
  styleUrl: './adocao.component.css'
})
export class AdocaoComponent {

  constructor(private authRedirect: AuthRedirectService) {}

  imgPetsAdocao = 'assets/img/adocao-pets.png';
  imgPataAdocao = '';

  petSelecionado = 0;

  petsAdocao = [
    {
      nome: 'Bella',
      titulo: 'Conheça Bella!',
      descricao:
        'Bella é uma Golden Retriever doce e carinhosa que adora carinho e longas caminhadas. Ela é amigável, brincalhona e se dá bem com outros animais de estimação. Bella procura uma família que lhe dê todo o amor e atenção que ela merece.',
      destaque:
        'Bella se desenvolve bem em uma casa ativa e adoraria ter um quintal grande para correr.',
      tags: ['Golden Retriever', '3 Anos', 'Fêmea', '26 Kg'],
      imagemPrincipal: 'assets/img/bella-principal.png',
      imagemMini1: 'assets/img/bella-1.png',
      imagemMini2: 'assets/img/bella-2.png',
      imagemMini3: 'assets/img/bella-3.png'
    },
    {
      nome: 'Thor',
      titulo: 'Conheça Thor!',
      descricao:
        'Thor é um cachorro alegre, protetor e muito companheiro. Gosta de brincar, passear e receber atenção.',
      destaque:
        'Thor combina com uma família carinhosa e que goste de passeios ao ar livre.',
      tags: ['Vira-lata', '2 Anos', 'Macho', '18 Kg'],
      imagemPrincipal: 'assets/img/thor-principal.webp',
      imagemMini1: 'assets/img/thor-1.jpg',
      imagemMini2: 'assets/img/thor-2.jpg',
      imagemMini3: 'assets/img/thor-3.jpeg'
    },
    {
      nome: 'Luna',
      titulo: 'Conheça Luna!',
      descricao:
        'Luna é uma gatinha tranquila, curiosa e muito carinhosa. Ama lugares confortáveis e companhia.',
      destaque:
        'Luna procura um lar calmo, seguro e cheio de carinho.',
      tags: ['Gata', '1 Ano', 'Fêmea', '4 Kg'],
      imagemPrincipal: 'assets/img/luna-principal.jpg',
      imagemMini1: 'assets/img/luna-1.jpg',
      imagemMini2: 'assets/img/luna-2.webp',
      imagemMini3: 'assets/img/luna-3.jpg'
    }
  ];

  petAnterior(): void {
    this.petSelecionado =
      this.petSelecionado === 0
        ? this.petsAdocao.length - 1
        : this.petSelecionado - 1;
  }

  proximoPet(): void {
    this.petSelecionado =
      this.petSelecionado === this.petsAdocao.length - 1
        ? 0
        : this.petSelecionado + 1;
  }

  imgPataPassos = '';

  passosAdocao = [
    { passo: 'Passo 1', titulo: 'Navegue pelo perfis de nossos Pets', imagem: '' },
    { passo: 'Passo 2', titulo: 'Visite Nossas Instalações', imagem: '' },
    { passo: 'Passo 3', titulo: 'Fazer perguntas', imagem: '' },
    { passo: 'Passo 4', titulo: 'Enviar um pedido de adoção', imagem: '' },
    { passo: 'Passo 5', titulo: 'Visita domiciliar', imagem: '' },
    { passo: 'Passo 6', titulo: 'Taxa de adoção', imagem: '' },
    { passo: 'Passo 7', titulo: 'Finalizar a Adoção', imagem: '' },
    { passo: 'Passo 8', titulo: 'Apoio Pós-Adoção', imagem: '' }
  ];

  irParaContato(): void {
    this.authRedirect.redirecionar('/user/contato');
  }

  irParaHome(): void {
    this.authRedirect.redirecionar('/user/home');
  }
}