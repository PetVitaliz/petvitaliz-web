import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contato',
  standalone: true,
  imports: [FormsModule],
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

  enviarMensagem(): void {
    if (
      !this.contato.nome.trim() ||
      !this.contato.email.trim() ||
      !this.contato.assunto.trim() ||
      !this.contato.mensagem.trim()
    ) {
      alert('Preencha todos os campos antes de enviar.');
      return;
    }

    alert('Mensagem enviada com sucesso!');

    this.contato = {
      nome: '',
      email: '',
      assunto: 'Agendamento de Consulta',
      mensagem: ''
    };
  }

  imgContatoFundo = '';
imgMapaFundo = '';

linkGoogleMaps = 'https://maps.google.com';
}