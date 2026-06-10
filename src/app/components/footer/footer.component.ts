import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthRedirectService } from '../../core/services/auth-redirect.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  constructor(private authRedirect: AuthRedirectService) {}
  logoFooter = '';

  pataGrandeFooter = '';
  pataPequenaFooter = '';

  iconInstagram = '';
  iconBehance = '';
  iconDribbble = '';
  iconLinkedin = '';

  irParaSobreNos(): void {
    this.authRedirect.redirecionar('/user/sobre-nos');
  }

  irParaHome(): void {
    this.authRedirect.redirecionar('/user/home');
  }

  irParaPlanoPet(): void {
    this.authRedirect.redirecionar('/user/planos-pet');
  }

  irParaServicos(): void {
    this.authRedirect.redirecionar('/user/servicos');
  }
}