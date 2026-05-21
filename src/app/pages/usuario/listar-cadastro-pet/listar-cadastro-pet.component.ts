import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-listar-cadastro-pet',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './listar-cadastro-pet.component.html',
  styleUrl: './listar-cadastro-pet.component.css'
})
export class ListarCadastroPetComponent implements OnInit {
  pets: any[] = [];
  petSelecionado: any = null;
  editando = false;

  ngOnInit(): void {
    this.carregarPets();
  }

  carregarPets(): void {
    this.pets = JSON.parse(localStorage.getItem('petsCadastrados') || '[]');
    this.petSelecionado = this.pets.length > 0 ? this.pets[0] : null;
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
    this.carregarPets();
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