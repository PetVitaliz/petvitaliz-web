import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-contrato-plano',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contrato-plano.component.html',
  styleUrl: './contrato-plano.component.css'
})
export class ContratoPlanoComponent implements OnInit {

  plano: any = null;
  aceitou = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.plano = JSON.parse(
      localStorage.getItem('planoSelecionado') || 'null'
    );
  }

  aceitarContrato(): void {

    if (!this.aceitou) {
      alert('Você precisa aceitar os termos.');
      return;
    }

    localStorage.setItem('planoAtivo', 'true');

    alert('Plano contratado com sucesso!');

    this.router.navigate(['/plano-sucesso']);
  }
}