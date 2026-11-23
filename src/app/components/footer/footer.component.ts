import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthRedirectService } from '../../core/services/auth-redirect.service';
import { ContatoRapidoService } from '../../core/services/contato-rapido.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  constructor(
    private authRedirect: AuthRedirectService,
    private router: Router,
    public contato: ContatoRapidoService
  ) {}

  ano = new Date().getFullYear();
  avisoContato = '';
  linkMapa = 'https://www.google.com/maps/search/?api=1&query=Av.+Paulista,+1000+-+Bela+Vista,+S%C3%A3o+Paulo+-+SP';

  // Logado: vai para a página da área do usuário.
  // Visitante: rola até a seção na home (as páginas públicas viraram seções).
  private irPara(rotaLogado: string, secao: string): void {
    if (localStorage.getItem('usuarioLogado')) {
      this.authRedirect.redirecionar(rotaLogado);
      return;
    }

    const rota = this.router.url.split('?')[0].split('#')[0];
    const el = document.getElementById(secao);

    if ((rota === '/' || rota === '/home') && el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      this.router.navigate(['/'], { fragment: secao });
    }
  }

  irParaPlanoPet(): void {
    this.irPara('/user/planos-pet', 'planos');
  }

  irParaServicos(): void {
    this.irPara('/user/servicos', 'servicos');
  }

  // Adoção fica só na home (inclusive para quem está logado)
  irParaAdocao(): void {
    if (!localStorage.getItem('usuarioLogado')) {
      this.irPara('', 'adocao');
      return;
    }
    const el = document.getElementById('adocao');
    if (this.router.url.split('#')[0] === '/user/home' && el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      this.router.navigate(['/user/home'], { fragment: 'adocao' });
    }
  }

  irParaSobreNos(): void {
    this.irPara('/user/sobre-nos', 'sobre');
  }

  irParaAreaCliente(): void {
    if (localStorage.getItem('usuarioLogado')) {
      this.authRedirect.redirecionar('/user/home');
    } else {
      this.router.navigate(['/login']);
    }
  }

  enviarMensagem(): void {
    if (localStorage.getItem('usuarioLogado')) {
      this.router.navigate(['/user/contato']);
      return;
    }
    this.avisoContato = 'Para enviar sua mensagem, entre na sua conta.';
  }
}
