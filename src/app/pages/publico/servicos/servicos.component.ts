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
    titulo: 'Consulta Veterinária',
    imagem: 'assets/img/consulta-veterinaria.jpg',
    tags: ['Avaliação Clínica', 'Prevenção']
  },
  {
    titulo: 'Programa de Imunização',
    imagem: 'assets/img/imunizacao.jpg',
    tags: ['Vacinação', 'Proteção']
  },
  {
    titulo: 'Diagnóstico Clínico',
    imagem: 'assets/img/diagnostico-clinico.jpg',
    tags: ['Exames', 'Monitoramento']
  },
  {
    titulo: 'Cuidados de Higiene e Estética',
    imagem: 'assets/img/higiene-estetica.jpeg',
    tags: ['Banho', 'Tosa']
  },
  {
    titulo: 'Atendimento Emergencial',
    imagem: 'assets/img/atendimento-emergencial.jpg',
    tags: ['Urgência', '24h']
  }
];

  selecionarServicoCarrossel(index: number): void {
    this.servicoCarrosselSelecionado = index;
  }

  imgTosaPrincipal = '';
  imgTosaMini1 = '';
  imgTosaMini2 = '';
  imgTosaMini3 = '';
}