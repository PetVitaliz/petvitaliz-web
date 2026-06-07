import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contato-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contato-usuario.component.html',
  styleUrl: './contato-usuario.component.css'
})
export class ContatoUsuarioComponent {
  contato = {
    nome: '',
    email: '',
    assunto: '',
    mensagem: ''
  };

  mensagemEnviada = false;

  enviarMensagem(): void {
    this.mensagemEnviada = true;

    setTimeout(() => {
      this.mensagemEnviada = false;
      this.contato = {
        nome: '',
        email: '',
        assunto: '',
        mensagem: ''
      };
    }, 2500);
  }
}