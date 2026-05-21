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

  ngOnInit(): void {
    this.plano = JSON.parse(
      localStorage.getItem('planoSelecionado') || 'null'
    );
  }
}