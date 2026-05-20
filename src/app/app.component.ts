import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';

import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderFuncionarioComponent } from './pages/funcionario/header-funcionario/header-funcionario.component';
import { HeaderAdmComponent } from './pages/adm/header-adm/header-adm.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    NgIf,
    HeaderComponent,
    HeaderFuncionarioComponent,
    HeaderAdmComponent,
    FooterComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  constructor(private router: Router) {}

  isFuncionarioRoute(): boolean {
    return this.router.url.includes('/funcionario');
  }

  isAdmRoute(): boolean {
    return this.router.url.includes('/adm');
  }
}