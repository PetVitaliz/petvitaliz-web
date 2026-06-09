import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contato',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contato.component.html',
  styleUrl: './contato.component.css'
})
export class ContatoComponent {
  iconAtendimento = '';
  iconTelefone = '';
  iconLocalizacao = '';

  contato = {
    nome: '',
    email: '',
    assunto: 'Agendamento de Consulta',
    mensagem: ''
  };

  erro = '';

  enviarMensagem(): void {
    this.erro = 'Faça login para utilizar esse recurso.';
  }

  imgContatoFundo = 'assets/img/clinica-fachada.jpg';
  imgMapaFundo = 'assets/img/mapa-fundo.jpg';

  linkGoogleMaps = 'https://maps.google.com';
}