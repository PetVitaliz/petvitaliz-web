import { Component, Input } from '@angular/core';

// Ícone de contorno do pet sem foto, conforme a espécie (mesmo traço dos outros ícones do site)
@Component({
  selector: 'app-icone-pet',
  standalone: true,
  template: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      @switch (tipo) {
        @case ('cachorro') {
          <path d="M8 6.2A6.5 6.5 0 0 1 16 6.2"/><path d="M8 6.2C5.5 5 3.5 6 3.5 9c0 2 1 3.5 2.5 3.8"/>
          <path d="M16 6.2c2.5-1.2 4.5-.2 4.5 2.8 0 2-1 3.5-2.5 3.8"/><path d="M6 10.5V14a6 6 0 0 0 12 0v-3.5"/>
          <circle class="olho" cx="9.5" cy="11.5" r=".7"/><circle class="olho" cx="14.5" cy="11.5" r=".7"/>
          <path d="M10.8 14.4h2.4L12 15.8z"/><path d="M12 15.8v1.3"/>
        }
        @case ('gato') {
          <path d="M5 4.5l3.2 4a8 8 0 0 1 7.6 0l3.2-4v8A7 7 0 0 1 12 19.5a7 7 0 0 1-7-7z"/>
          <circle class="olho" cx="9.4" cy="12.2" r=".7"/><circle class="olho" cx="14.6" cy="12.2" r=".7"/>
          <path d="M11 14.6h2L12 15.6z"/>
        }
        @case ('coelho') {
          <path d="M9.2 9.6C8 7.5 7.6 3.5 9 3c1.5-.5 2.6 3.3 2.8 6"/><path d="M14.8 9.6C16 7.5 16.4 3.5 15 3c-1.5-.5-2.6 3.3-2.8 6"/>
          <path d="M12 9a5.5 5.5 0 0 0-5.5 5.5c0 3 2.5 5 5.5 5s5.5-2 5.5-5A5.5 5.5 0 0 0 12 9z"/>
          <circle class="olho" cx="10" cy="13.6" r=".7"/><circle class="olho" cx="14" cy="13.6" r=".7"/>
          <path d="M11.2 16h1.6l-.8.8z"/>
        }
        @case ('ave') {
          <path d="M15.5 6.5a3.5 3.5 0 0 0-6.6 1.6c0 1-.2 2-.9 2.8L4 15.5c3.5 1.5 8 1 10.5-1.6a6 6 0 0 0 1.5-4.4"/>
          <path d="M15.5 6.5 19 7.6l-3 1.4"/><circle class="olho" cx="13" cy="7.8" r=".7"/>
          <path d="M9 16.6 8 20M12 16.4 11.5 20"/>
        }
        @default {
          <circle cx="6.6" cy="10.4" r="1.8"/><circle cx="10.1" cy="6.3" r="1.8"/><circle cx="13.9" cy="6.3" r="1.8"/>
          <circle cx="17.4" cy="10.4" r="1.8"/>
          <path d="M12 11.6c-2.4 0-4.8 3-4.8 5.2 0 1.5 1.2 2.3 2.5 2.3.9 0 1.5-.5 2.3-.5s1.4.5 2.3.5c1.3 0 2.5-.8 2.5-2.3 0-2.2-2.4-5.2-4.8-5.2z"/>
        }
      }
    </svg>
  `,
  styles: [`
    :host { display: inline-flex; width: 55%; height: 55%; color: #21479B; }
    svg { width: 100%; height: 100%; fill: none; stroke: currentColor; stroke-width: 1.3; stroke-linecap: round; stroke-linejoin: round; }
    .olho { fill: currentColor; stroke: none; }
  `]
})
export class IconePetComponent {
  tipo = '';

  @Input() set especie(valor: string | null | undefined) {
    const e = String(valor || '').toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').trim();
    this.tipo = e === 'cao' ? 'cachorro' : e === 'passaro' ? 'ave' : e;
  }
}
