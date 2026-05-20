import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authAdminGuard: CanActivateFn = () => {

  const router = inject(Router);

  const usuario = localStorage.getItem('usuarioLogado');

  if (!usuario) {
    router.navigate(['/usuario/login']);
    return false;
  }

  const usuarioLogado = JSON.parse(usuario);

  if (usuarioLogado.tipo !== 'admin') {
    router.navigate(['/usuario/login']);
    return false;
  }

  return true;

};