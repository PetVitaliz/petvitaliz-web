import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthRedirectService {

  constructor(private router: Router) {}

  redirecionar(rotaLogado: string, rotaLogin: string = '/login'): void {
    const usuario = localStorage.getItem('usuarioLogado');
    
    if (usuario) {
      this.router.navigate([rotaLogado]);
    } else {
      this.router.navigate([rotaLogin]);
    }
  }
}