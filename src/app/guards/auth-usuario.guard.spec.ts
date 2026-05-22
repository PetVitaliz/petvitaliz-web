import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { authUsuarioGuard } from './auth-usuario.guard';

describe('authUsuarioGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => authUsuarioGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
