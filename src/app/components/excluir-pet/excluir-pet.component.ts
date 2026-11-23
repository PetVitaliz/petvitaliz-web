import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

// Janela de confirmação para excluir um pet.
// Com plano: o pet e o plano continuam até o fim do período pago e saem juntos depois.
@Component({
  selector: 'app-excluir-pet',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fundo" (click)="!processando && cancelar.emit()">
      <div class="janela" role="alertdialog" aria-modal="true" [attr.aria-label]="'Excluir ' + nomePet" (click)="$event.stopPropagation()">
        <span class="icone" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6"/></svg>
        </span>
        <h2>Excluir {{ nomePet }}?</h2>

        @if (plano) {
          <p>{{ nomePet }} tem o <strong>{{ plano }}</strong> ({{ ciclo }}). Ao excluir, <strong>o plano também será cancelado</strong>.</p>
          <div class="periodo">
            <div><span>Período já pago até</span><strong>{{ fim }}</strong></div>
            <div><span>Dias restantes</span><strong>{{ dias }}</strong></div>
          </div>
          <p class="nota">Até {{ fim }}, {{ nomePet }} continua aparecendo e pode usar consultas e serviços normalmente. Depois disso, o pet e o plano são excluídos e não há novas cobranças. Você pode desfazer até lá.</p>
        } @else {
          <p>O cadastro e o histórico de {{ nomePet }} serão apagados. Essa ação não pode ser desfeita.</p>
        }

        <div class="acoes">
          <button type="button" class="btn perigo" [disabled]="processando" (click)="confirmar.emit()">
            {{ processando ? 'Excluindo…' : plano ? 'Excluir pet e cancelar plano' : 'Excluir pet' }}
          </button>
          <button type="button" class="btn claro" [disabled]="processando" (click)="cancelar.emit()">Manter {{ nomePet }}</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .fundo { position: fixed; inset: 0; z-index: 1000; display: grid; place-items: center; padding: 20px; background: rgba(24, 59, 114, 0.45); }
    .janela { width: 100%; max-width: 440px; padding: 28px 24px 20px; border-radius: 22px; background: #ffffff; color: #183B72; text-align: center; font-family: 'Plus Jakarta Sans', sans-serif; }
    .icone { display: inline-grid; place-items: center; width: 58px; height: 58px; border-radius: 50%; background: #FCEBEB; color: #B3261E; }
    svg { width: 26px; height: 26px; fill: none; stroke: currentColor; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }
    h2 { margin: 14px 0 8px; font-size: 22px; }
    p { margin: 0 0 14px; color: #52627D; line-height: 1.55; }
    p strong { color: #183B72; }
    .periodo { display: grid; grid-template-columns: 1fr 1fr; margin: 0 0 14px; border: 1px solid #E1E7F3; border-radius: 14px; text-align: left; }
    .periodo div { display: flex; flex-direction: column; padding: 12px 14px; }
    .periodo div + div { border-left: 1px solid #E1E7F3; }
    .periodo span { font-size: 12px; color: #71809A; }
    .periodo strong { margin-top: 2px; font-size: 16px; }
    .nota { font-size: 13px; }
    .acoes { display: grid; gap: 8px; margin-top: 4px; }
    .btn { height: 46px; border: none; border-radius: 12px; font: inherit; font-size: 15px; font-weight: 700; cursor: pointer; }
    .btn:disabled { opacity: 0.6; cursor: default; }
    .perigo { background: #B3261E; color: #ffffff; }
    .claro { background: #F1F4FA; color: #183B72; }
  `]
})
export class ExcluirPetComponent {
  @Input() nomePet = '';
  @Input() plano = '';
  @Input() ciclo = 'mensal';
  @Input() fim = '';
  @Input() dias = '';
  @Input() processando = false;
  @Output() confirmar = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();
}
