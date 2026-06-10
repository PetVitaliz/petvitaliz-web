import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

type ServicoCarrossel = {
  titulo: string;
  imagem: string;
  tags: string[];
};

@Component({
  selector: 'app-servicos',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './servicos.component.html',
  styleUrl: './servicos.component.css'
})
export class ServicosComponent {
  imgPetsServicos = 'assets/img/servicos-principal.png';
  imgPataServicos = 'assets/img/Group.png';
  imgServicosInfo = 'assets/img/australian-cattle.png';

  servicosInfo = [
    {
      titulo: 'Serviços abrangentes',
      descricao: 'Desde cuidados pessoais e treinamento até exames médicos e creches, oferecemos soluções completas para o bem-estar do seu animal de estimação.'
    },
    {
      titulo: 'Especialistas Certificados',
      descricao: 'Profissionais treinados e apaixonados por animais para oferecer o melhor atendimento possível.'
    },
    {
      titulo: 'Instalações de última geração',
      descricao: 'Espaços modernos e preparados para garantir conforto, segurança e bem-estar.'
    },
    {
      titulo: 'Confiável por donos de pet',
      descricao: 'Construímos confiança através de atendimento humanizado e resultados reais.'
    }
  ];

  servicoCarrosselSelecionado = 0;

  servicosCarrossel: ServicoCarrossel[] = [
    {
      titulo: 'Suprimento de Pet',
      imagem: 'assets/img/carrosel1.png',
      tags: ['Brinquedos', 'Acessórios']
    },
    {
      titulo: 'Serviços de Higiene',
      imagem: 'assets/img/carrosel2.png',
      tags: ['Corte de Unhas', 'Limpeza de Ouvido']
    },
    {
      titulo: 'Suporte Veterinario',
      imagem: 'assets/img/carrosel3.png',
      tags: ['Check-Ups', 'Vacinação']
    },
    {
      titulo: 'Assistencia com Adoção',
      imagem: 'assets/img/carrosel4.png',
      tags: ['Abrigos locais', 'Pet Perfeito']
    },
    {
      titulo: 'Hospedagem & Creche Para Pets',
      imagem: 'assets/img/carrosel5.png',
      tags: ['Hora de Brincar', 'Alimentação']
    }
  ];

  selecionarServicoCarrossel(index: number): void {
    this.servicoCarrosselSelecionado = index;
  }

  imgTosaPrincipal = 'assets/img/animals-for.png';
  imgTosaMini1 = 'assets/img/nail-clipping.png';
  imgTosaMini2 = 'assets/img/young-mother.png';
  imgTosaMini3 = 'assets/img/unrecognizable.png';
}