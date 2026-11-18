import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { tap } from 'rxjs';
import { environment } from '../../environments/environment';

const CHAVE_TOKEN_SESSAO = 'tokenSessao';
const CHAVE_TOKEN_RESET = 'tokenReset';
const ROTAS_LOGIN = /\/user\/login(\/adm|\/funcionario)?$/;
const ROTA_CONFIRMAR_CODIGO = /\/user\/login\/esqueci-a-senha-confirmar$/;
const ROTA_ALTERAR_SENHA = /\/user\/login\/alterar-senha$/;
const ROTA_LOGOUT = /\/logout$/;

function ler(armazenamento: Storage, chave: string): string | null {
  try {
    return armazenamento.getItem(chave);
  } catch {
    return null;
  }
}

function gravar(armazenamento: Storage, chave: string, valor: string | null): void {
  try {
    if (valor) {
      armazenamento.setItem(chave, valor);
    } else {
      armazenamento.removeItem(chave);
    }
  } catch {
  }
}

export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  const caminho = req.url.slice(environment.apiUrl.length).split('?')[0];

  if (req.method === 'POST' && ROTAS_LOGIN.test(caminho)) {
    gravar(localStorage, CHAVE_TOKEN_SESSAO, null);
    return next(req.clone({ setHeaders: { 'X-Client-Type': 'web' } })).pipe(
      tap((evento) => {
        if (evento instanceof HttpResponse) {
          const token = (evento.body as any)?.token;
          gravar(localStorage, CHAVE_TOKEN_SESSAO, typeof token === 'string' ? token : null);
        }
      })
    );
  }

  if (ROTA_CONFIRMAR_CODIGO.test(caminho)) {
    return next(req).pipe(
      tap((evento) => {
        if (evento instanceof HttpResponse) {
          const token = (evento.body as any)?.token_reset;
          gravar(sessionStorage, CHAVE_TOKEN_RESET, typeof token === 'string' ? token : null);
        }
      })
    );
  }

  if (ROTA_ALTERAR_SENHA.test(caminho)) {
    const tokenReset = ler(sessionStorage, CHAVE_TOKEN_RESET);
    const pedido = tokenReset ? req.clone({ setHeaders: { Authorization: `Bearer ${tokenReset}` } }) : req;
    return next(pedido).pipe(
      tap((evento) => {
        if (evento instanceof HttpResponse) {
          gravar(sessionStorage, CHAVE_TOKEN_RESET, null);
        }
      })
    );
  }

  const token = ler(localStorage, CHAVE_TOKEN_SESSAO);
  const pedido = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  if (ROTA_LOGOUT.test(caminho)) {
    gravar(localStorage, CHAVE_TOKEN_SESSAO, null);
  }

  return next(pedido);
};
