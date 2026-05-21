import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cadastro-pet',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cadastro-pet.component.html',
  styleUrl: './cadastro-pet.component.css'
})
export class CadastroPetComponent {
  tutor = '';
  nomePet = '';
  especie = '';
  idade = '';
  sexo = '';
  peso = '';
  cor = '';
  outraCor = '';

  fotoPreview: string | ArrayBuffer | null = null;

  selecionarSexo(sexo: string): void {
    this.sexo = sexo;
  }

  selecionarCor(cor: string): void {
    this.cor = cor;
  }

  carregarFoto(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) return;

    const arquivo = input.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      this.fotoPreview = reader.result;
    };

    reader.readAsDataURL(arquivo);
  }

  confirmarCadastro(): void {
    const novoPet = {
      tutor: this.tutor,
      nomePet: this.nomePet,
      especie: this.especie,
      idade: this.idade,
      sexo: this.sexo,
      peso: this.peso,
      cor: this.outraCor || this.cor,
      foto: this.fotoPreview,
      observacoes: 'Pet cadastrado pelo tutor. Informações disponíveis para acompanhamento veterinário.'
    };

    const petsSalvos = JSON.parse(localStorage.getItem('petsCadastrados') || '[]');

    petsSalvos.push(novoPet);

    localStorage.setItem('petsCadastrados', JSON.stringify(petsSalvos));

    alert('Pet cadastrado com sucesso!');
  }
}