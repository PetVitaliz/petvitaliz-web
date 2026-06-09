import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-contato-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './contato-usuario.component.html',
  styleUrl: './contato-usuario.component.css'
})
export class ContatoUsuarioComponent implements OnInit {
  
  contato = {
    nome: '',
    email: '',
    assunto: 'Agendamento de Consulta',
    mensagem: ''
  };

  mensagemEnviada = false;
  enviando = false;
  erro = '';

  imgContatoFundo = 'assets/img/clinica-fachada.jpg'; 
  imgMapaFundo = 'assets/img/mapa-fundo.jpg';
  linkGoogleMaps = 'https://maps.google.com/?q=Av.+Paulista,+1000+-+Bela+Vista,+São+Paulo+-+SP';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado') || 'null');
    if (usuarioLogado) {
      this.contato.nome = `${usuarioLogado.nome} ${usuarioLogado.sobrenome || ''}`.trim();
      this.contato.email = usuarioLogado.email || '';
    }
  }

  enviarMensagem(): void {
    this.erro = '';
    this.mensagemEnviada = false;

    if (!this.contato.nome.trim() || !this.contato.email.trim()) {
      this.erro = 'Por favor, confira os seus dados de cadastro.';
      return;
    }

    if (!this.contato.mensagem || this.contato.mensagem.length < 6) {
      this.erro = 'A mensagem precisa ter pelo menos 6 caracteres.';
      return;
    }

    this.enviando = true;

    const payload = {
      email: this.contato.email,
      mensagem: `[Assunto: ${this.contato.assunto}] - ${this.contato.mensagem}`
    };

    this.http.post<any>(`${environment.apiUrl}/user/contato`, payload, { withCredentials: true }).subscribe({
      next: (res) => {
        this.mensagemEnviada = true;
        this.enviando = false;
        this.contato.mensagem = '';
        this.contato.assunto = 'Agendamento de Consulta';
      },
      error: (err) => {
        this.enviando = false;
        console.error('Erro ao enviar mensagem de contato:', err);
        this.erro = err.error?.mensagem || err.error || 'Não foi possível enviar sua mensagem no momento.';
      }
    });
  }
}