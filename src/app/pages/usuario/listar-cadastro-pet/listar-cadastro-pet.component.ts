import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-listar-cadastro-pet',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './listar-cadastro-pet.component.html',
  styleUrl: './listar-cadastro-pet.component.css'
})
export class ListarCadastroPetComponent implements OnInit {
  pets: any[] = [];
  petSelecionado: any = null;
  planoContratado: any = null;
  usuarioLogado: any = null;
  editando = false;

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    this.pets = JSON.parse(localStorage.getItem('petsCadastrados') || '[]');
    this.petSelecionado = this.pets.length > 0 ? this.pets[0] : null;

    this.planoContratado = JSON.parse(localStorage.getItem('planoSelecionado') || 'null');
    this.usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado') || 'null');
  }

  get nomeTutor(): string {
    return this.usuarioLogado?.nome || this.usuarioLogado?.nomeCompleto || this.petSelecionado?.tutor || 'Tutor';
  }

  get emailTutor(): string {
    return this.usuarioLogado?.email || 'E-mail não informado';
  }

  editarPet(): void {
    this.editando = true;
  }

  salvarEdicao(): void {
    localStorage.setItem('petsCadastrados', JSON.stringify(this.pets));
    this.editando = false;
    alert('Informações atualizadas com sucesso!');
  }

  cancelarEdicao(): void {
    this.carregarDados();
    this.editando = false;
  }

  excluirPet(): void {
    if (!this.petSelecionado) return;

    const confirmar = confirm('Deseja excluir este cadastro?');
    if (!confirmar) return;

    this.pets = this.pets.filter(pet => pet !== this.petSelecionado);
    localStorage.setItem('petsCadastrados', JSON.stringify(this.pets));

    this.petSelecionado = this.pets.length > 0 ? this.pets[0] : null;
    this.editando = false;
  }
}