import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthRedirectService } from '../../../core/services/auth-redirect.service';

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
  constructor(private authRedirect: AuthRedirectService) {}

  imgPetsServicos = '';
  imgPataServicos = '';
  imgServicosInfo = '';

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

  selecionarServicoCarrossel(index: number): void {
    this.servicoCarrosselSelecionado = index;
  }

  imgTosaPrincipal = '';
  imgTosaMini1 = '';
  imgTosaMini2 = '';
  imgTosaMini3 = '';

  irParaAgendamento(): void {
    this.authRedirect.redirecionar('/user/agendamento');
  }
}