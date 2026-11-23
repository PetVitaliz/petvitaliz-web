import { Component, HostListener } from '@angular/core';
import { SairService } from '../../core/services/sair.service';

@Component({
  selector: 'app-confirmar-sair',
  standalone: true,
  template: `
    @if (sair.aberto) {
      <div class="fundo" (click)="sair.cancelar()">
        <div class="card" role="alertdialog" aria-modal="true" aria-labelledby="titulo-sair" aria-describedby="texto-sair" (click)="$event.stopPropagation()">
          <span class="icone" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
          </span>
          <h2 id="titulo-sair">{{ sair.nome ? 'Já vai, ' + sair.nome + '?' : 'Sair da conta?' }}</h2>
          <p id="texto-sair">Você vai sair da sua conta neste aparelho. Para ver seus pets, planos e consultas, é só entrar de novo.</p>
          <div class="acoes">
            <button type="button" class="btn sair" [disabled]="sair.saindo" (click)="sair.confirmar()">{{ sair.saindo ? 'Saindo…' : 'Sair da conta' }}</button>
            <button type="button" class="btn ficar" [disabled]="sair.saindo" (click)="sair.cancelar()" #ficar>Continuar conectado</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .fundo { position: fixed; inset: 0; z-index: 2000; display: grid; place-items: center; padding: 20px; background: rgba(24, 59, 114, 0.45); animation: aparecer 0.15s ease-out; }
    .card { width: 100%; max-width: 400px; padding: 30px 26px 22px; border-radius: 22px; background: #ffffff; color: #183B72; text-align: center; font-family: 'Plus Jakarta Sans', sans-serif; box-shadow: 0 24px 60px rgba(24, 59, 114, 0.25); animation: subir 0.2s ease-out; }
    .icone { display: inline-grid; place-items: center; width: 60px; height: 60px; border-radius: 50%; background: #E8EEFA; color: #21479B; }
    svg { width: 26px; height: 26px; fill: none; stroke: currentColor; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }
    h2 { margin: 16px 0 8px; font-size: 22px; font-weight: 800; }
    p { margin: 0 0 22px; color: #52627D; font-size: 15px; line-height: 1.55; }
    .acoes { display: grid; gap: 8px; }
    .btn { height: 48px; border: none; border-radius: 12px; font: inherit; font-size: 15px; font-weight: 700; cursor: pointer; }
    .btn:disabled { opacity: 0.6; cursor: default; }
    .sair { background: #183B72; color: #ffffff; }
    .sair:hover:not(:disabled) { background: #21479B; }
    .ficar { background: #F1F4FA; color: #183B72; }
    .ficar:hover:not(:disabled) { background: #E8EEFA; }
    @keyframes aparecer { from { opacity: 0; } }
    @keyframes subir { from { opacity: 0; transform: translateY(12px) scale(0.98); } }
    @media (prefers-reduced-motion: reduce) { .fundo, .card { animation: none; } }
  `]
})
export class ConfirmarSairComponent {
  constructor(public sair: SairService) {}

  @HostListener('document:keydown.escape')
  fecharComEsc(): void {
    this.sair.cancelar();
  }
}
