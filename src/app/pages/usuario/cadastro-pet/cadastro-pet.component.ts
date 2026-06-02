import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { DataMaskDirective } from './data-mask.directive';

@Component({
  selector: 'app-cadastro-pet',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DataMaskDirective],
  templateUrl: './cadastro-pet.component.html',
  styleUrl: './cadastro-pet.component.css'
})
export class CadastroPetComponent {
  nomePet = '';
  especie = '';
  outraEspecie = '';
  dataNascimento = '';
  idade: number | string = '';
  sexo = '';
  peso = '';
  
  fotoArquivo: File | null = null;
  fotoPreview: string | ArrayBuffer | null = null;

  erro = '';
  sucesso = '';
  salvando = false;

  constructor(private http: HttpClient, private router: Router) {}

  selecionarSexo(sexo: string): void {
    this.sexo = sexo;
  }

  carregarFoto(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    this.fotoArquivo = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      this.fotoPreview = reader.result;
    };
    reader.readAsDataURL(this.fotoArquivo);
  }

  calcularIdadeAutomaticamente(): void {
    if (this.dataNascimento.length === 10) {
      const partes = this.dataNascimento.split('/');
      const dia = parseInt(partes[0], 10);
      const mes = parseInt(partes[1], 10) - 1;
      const ano = parseInt(partes[2], 10);

      const dataNasc = new Date(ano, mes, dia);
      const hoje = new Date();

      if (!isNaN(dataNasc.getTime())) {
        let anosCalculados = hoje.getFullYear() - dataNasc.getFullYear();
        const m = hoje.getMonth() - dataNasc.getMonth();
        
        if (m < 0 || (m === 0 && hoje.getDate() < dataNasc.getDate())) {
          anosCalculados--;
        }

        this.idade = anosCalculados >= 0 ? anosCalculados : 0;
      }
    } else {
      this.idade = '';
    }
  }

  confirmarCadastro(): void {
    if (this.salvando) return;

    this.erro = '';
    this.sucesso = '';

    if (!this.nomePet || !this.especie || !this.sexo || !this.dataNascimento) {
      this.erro = 'Por favor, preencha os campos obrigatórios.';
      return;
    }

    if (this.especie === 'Outro' && !this.outraEspecie) {
      this.erro = 'Por favor, informe qual é a outra espécie.';
      return;
    }

    const partes = this.dataNascimento.split('/');
    if (partes.length !== 3) {
      this.erro = 'Data de nascimento inválida. Use o formato DD/MM/AAAA.';
      return;
    }

    const dia = parseInt(partes[0], 10);
    const mes = parseInt(partes[1], 10) - 1;
    const ano = parseInt(partes[2], 10);

    const dataTeste = new Date(ano, mes, dia);
    const anoAtual = new Date().getFullYear();

    if (
      dataTeste.getFullYear() !== ano ||
      dataTeste.getMonth() !== mes ||
      dataTeste.getDate() !== dia ||
      ano < 1900 || 
      ano > anoAtual
    ) {
      this.erro = 'Data de nascimento inválida ou impossível.';
      return;
    }

    this.salvando = true;

    const dataFinalISO = `${ano}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}T00:00:00.000Z`;

    const sexoLower = this.sexo.toLowerCase().trim();
    let sexoFormatado = '';
    if (sexoLower === 'masculino' || sexoLower === 'm') {
      sexoFormatado = 'm';
    } else if (sexoLower === 'feminino' || sexoLower === 'f') {
      sexoFormatado = 'f';
    }

    const formData = new FormData();
    formData.append('nome', this.nomePet);
    formData.append('especie', this.especie);
    formData.append('outra_especie', this.outraEspecie);
    formData.append('sexo', sexoFormatado);
    formData.append('data_nascimento', dataFinalISO);
    formData.append('idade', String(this.idade || 0));
    formData.append('peso', this.peso);

    if (this.fotoArquivo) {
      formData.append('image', this.fotoArquivo, this.fotoArquivo.name); 
    }

    this.http.post(`${environment.apiUrl}/user/listar/pet/cadastar`, formData, {
      withCredentials: true 
    })
    .subscribe({
      next: (response: any) => {
        this.sucesso = typeof response === 'string' ? response : (response.mensagem || 'Pet cadastrado com sucesso! 🐶');
        setTimeout(() => {
          this.router.navigate(['/user/listar/pet']); 
        }, 2000);
      },
      error: (err) => {
        console.error('Erro ao cadastrar pet:', err);
        this.salvando = false;
        
        if (err.error) {
          this.erro = err.error.mensagem || err.error.message || (typeof err.error === 'string' ? err.error : 'Erro ao processar.');
        } else {
          this.erro = 'Erro interno ao tentar salvar o pet.';
        }
      }
    });
  }
}
