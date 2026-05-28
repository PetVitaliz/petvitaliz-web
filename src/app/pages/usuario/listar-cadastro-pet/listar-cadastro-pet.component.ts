import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment'; 
import { DataMaskDirective } from './data-mask.directive';

@Component({
  selector: 'app-listar-cadastro-pet',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, DataMaskDirective],
  templateUrl: './listar-cadastro-pet.component.html',
  styleUrl: './listar-cadastro-pet.component.css'
})
export class ListarCadastroPetComponent implements OnInit {
  pets: any[] = [];
  petSelecionado: any = null;
  planoContratado: any = null;
  usuarioLogado: any = null;
  
  editando = false;
  petForm: any = {};

  erro = '';
  sucesso = '';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.carregarDadosLocais();
    this.buscarPetsDoBanco();
  }

  carregarDadosLocais(): void {
    this.planoContratado = JSON.parse(localStorage.getItem('planoSelecionado') || 'null');
    this.usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado') || 'null');
  }

  buscarPetsDoBanco(): void {
    this.erro = '';
    this.http.get(`${environment.apiUrl}/user/listar/pet`, { withCredentials: true })
      .subscribe({
        next: (response: any) => {
          this.pets = response.Pets || response.pets || [];
          this.petSelecionado = this.pets.length > 0 ? this.pets[0] : null;
        },
        error: (err) => {
          console.error('Erro ao buscar pets:', err);
          this.erro = 'Não foi possível carregar a lista de pets do banco.';
        }
      });
  }

  get nomeTutor(): string {
    return this.usuarioLogado?.nome || 'Responsável';
  }

  get emailTutor(): string {
    return this.usuarioLogado?.email || 'E-mail não informado';
  }

  editarPet(): void {
    this.petForm = { ...this.petSelecionado };
    
    if (this.petForm.data_nascimento) {
      const apenasData = this.petForm.data_nascimento.split('T')[0];
      const partes = apenasData.split('-');
      if (partes.length === 3) {
        this.petForm.data_nascimento = `${partes[2]}/${partes[1]}/${partes[0]}`;
      }
    }
    
    this.editando = true;
  }

  recalcularIdadeNoModal(): void {
    if (this.petForm.data_nascimento && this.petForm.data_nascimento.length === 10) {
      const partes = this.petForm.data_nascimento.split('/');
      if (partes.length === 3) {
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

          this.petForm.idade = anosCalculados >= 0 ? anosCalculados : 0;
        }
      }
    } else {
      this.petForm.idade = ''; 
    }
  }

  salvarEdicao(): void {
    this.erro = '';
    this.sucesso = '';

    if (!this.petForm) return;

    const partes = this.petForm.data_nascimento.split('/');
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

    const dataFinalISO = `${ano}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}T00:00:00.000Z`;

    const dadosAtualizados = {
      nome: this.petForm.nome,
      especie: this.petForm.especie,
      outra_especie: this.petForm.outra_especie,
      sexo: this.petForm.sexo,
      data_nascimento: dataFinalISO,
      idade: Number(this.petForm.idade),
      peso: this.petForm.peso ? Number(this.petForm.peso) : null,
      observacoes: this.petForm.observacoes
    };

    this.http.put(`${environment.apiUrl}/user/listar/pet/editar/${this.petForm.id_pet}`, dadosAtualizados, { withCredentials: true })
      .subscribe({
        next: (response: any) => {
          this.sucesso = 'Informações atualizadas com sucesso';
          this.editando = false;
          this.buscarPetsDoBanco(); 
        },
        error: (err) => {
          console.error('Erro ao editar pet:', err);
          this.erro = err.error?.mensagem || 'Erro ao atualizar os dados do pet.';
        }
      });
  }

  cancelarEdicao(): void {
    this.editando = false;
    this.petForm = {};
  }

  excluirPet(): void {
    if (!this.petSelecionado) return;

    const confirmar = confirm(`Deseja realmente excluir o histórico de ${this.petSelecionado.nome}?`);
    if (!confirmar) return;

    this.http.delete(`${environment.apiUrl}/user/listar/pet/delete/${this.petSelecionado.id_pet}`, { withCredentials: true })
      .subscribe({
        next: (response: any) => {
          alert('Pet removido com sucesso.');
          this.buscarPetsDoBanco(); 
        },
        error: (err) => {
          console.error('Erro ao excluir pet:', err);
          this.erro = err.error?.mensagem || 'Não foi possível excluir o registro.';
        }
      });
  }
}