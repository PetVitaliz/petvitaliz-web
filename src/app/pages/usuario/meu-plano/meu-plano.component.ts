import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-meu-plano',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './meu-plano.component.html',
  styleUrl: './meu-plano.component.css'
})
export class MeuPlanoComponent implements OnInit {

  plano: any = null;

  ngOnInit(): void {
    const planoSalvo = localStorage.getItem('planoSelecionado');

    if (planoSalvo) {
      this.plano = JSON.parse(planoSalvo);
    }
  }

  cancelarPlano(): void {
    if (confirm('Deseja realmente cancelar seu plano?')) {
      localStorage.removeItem('planoSelecionado');
      this.plano = null;
    }
  }
}