import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthRedirectService } from '../../../core/services/auth-redirect.service';

@Component({
  selector: 'app-sobre-nos',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './sobre-nos.component.html',
  styleUrl: './sobre-nos.component.css'
})
export class SobreNosComponent {
  constructor(private authRedirect: AuthRedirectService) {}
  imgPetsSobre = '';
  imgPataSobre = '';

  imgIconPrecisao = '';
  imgIconBemEstar = '';
  categoriasEquipe = [
  'Veterinário(a)',
  'Recepcionista',
  'Gerente da clínica',
  'Tosador(a)',
  'Equipe de hospedagem'
];

equipeSobre = [
  { nome: 'Dr. Jenny Wilson', imagem: '', experiencia: '20+ anos de experiência' },
  { nome: 'Dr. Jane Cooper', imagem: '', experiencia: '20+ anos de experiência' },
  { nome: 'Dr. Jacob Jones', imagem: '', experiencia: '20+ anos de experiência' },
  { nome: 'Dr. Guy Hawkins', imagem: '', experiencia: '20+ anos de experiência' },
  { nome: 'Dr. Kristin Watson', imagem: '', experiencia: '20+ anos de experiência' },
  { nome: 'Dr. Theresa Webb', imagem: '', experiencia: '20+ anos de experiência' },
  { nome: 'Dr. Selena Grey', imagem: '', experiencia: '20+ anos de experiência' },
  { nome: 'Dr. Kathryn Murphy', imagem: '', experiencia: '20+ anos de experiência' }
];

valoresSobre = [
  {
    titulo: 'COMPAIXÃO',
    descricao: 'Tratamos cada pet com bondade e empatia, entendendo suas necessidades e emoções únicas.',
    icone: ''
  },

  {
    titulo: 'INTEGRIDADE',
    descricao: 'Estamos comprometidos com a honestidade, transparência e práticas éticas em todos os aspectos do nosso cuidado.',
    icone: ''
  },

  {
    titulo: 'EXCELÊNCIA',
    descricao: 'Nos esforçamos para fornecer o mais alto padrão de atendimento veterinário por meio de aprendizado contínuo e dedicação.',
    icone: ''
  },

  {
    titulo: 'COLABORAÇÃO',
    descricao: 'Trabalhamos em estreita colaboração com os donos de pets e uma equipe de profissionais qualificados para garantir os melhores resultados para cada pet.',
    icone: ''
  }
];

  irParaAgendamento(): void {
      this.authRedirect.redirecionar('/user/agendamento');
    }

  irParaPet(): void {
    this.authRedirect.redirecionar('/user/listar/pet');
  }
}