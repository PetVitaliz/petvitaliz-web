import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-plano-sucesso',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './plano-sucesso.component.html',
  styleUrl: './plano-sucesso.component.css'
})
export class PlanoSucessoComponent implements OnInit {
  plano: any = null;
  nomeTutor: string = 'Tutor PetVitaliz';
  dataInicio: string = '';

  ngOnInit(): void {
    this.plano = JSON.parse(
      localStorage.getItem('planoSelecionado') || 'null'
    );

    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado') || 'null');
    if (usuarioLogado && usuarioLogado.nome) {
      this.nomeTutor = usuarioLogado.nome;
    }

    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const dataAtual = new Date();
    this.dataInicio = `${meses[dataAtual.getMonth()]} ${dataAtual.getFullYear()}`;
  }
}