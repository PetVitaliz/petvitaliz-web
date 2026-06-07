import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authUsuarioGuard: CanActivateFn = () => {
  const router = inject(Router);
  const usuarioLogado = localStorage.getItem('usuarioLogado');

  if (usuarioLogado) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};