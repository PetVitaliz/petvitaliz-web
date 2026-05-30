import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.prod';

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
  modalCadastroAberto = false;
  salvando = false;

  petForm: any = {};

  nomePet = '';
  especie = '';
  outraEspecie = '';
  idade = '';
  sexo = '';
  peso: number | null = null;
  fotoPreview: string | ArrayBuffer | null = null;
  fotoArquivo: File | null = null;

  erro = '';
  sucesso = '';

  constructor(private http: HttpClient) {}

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

  abrirCadastroPet(): void {
    this.limparFormularioCadastro();
    this.modalCadastroAberto = true;
  }

  fecharCadastroPet(): void {
    this.modalCadastroAberto = false;
    this.limparFormularioCadastro();
  }

  limparFormularioCadastro(): void {
    this.nomePet = '';
    this.especie = '';
    this.outraEspecie = '';
    this.idade = '';
    this.sexo = '';
    this.peso = null;
    this.fotoPreview = null;
    this.fotoArquivo = null;
    this.erro = '';
    this.sucesso = '';
    this.salvando = false;
  }

  carregarFoto(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) return;

    const arquivo = input.files[0];

    if (!arquivo.type.startsWith('image/')) {
      this.erro = 'Selecione uma imagem válida.';
      return;
    }

    if (arquivo.size > 5 * 1024 * 1024) {
      this.erro = 'A imagem deve ter no máximo 5MB.';
      return;
    }

    this.fotoArquivo = arquivo;

    const reader = new FileReader();
    reader.onload = () => {
      this.fotoPreview = reader.result;
    };

    reader.readAsDataURL(arquivo);
  }

  confirmarCadastro(): void {
    this.erro = '';
    this.sucesso = '';

    if (!this.nomePet.trim()) {
      this.erro = 'Informe o nome do pet.';
      return;
    }

    if (!this.especie) {
      this.erro = 'Selecione a espécie do pet.';
      return;
    }

    if (this.especie === 'Outro' && !this.outraEspecie.trim()) {
      this.erro = 'Informe qual é a espécie do pet.';
      return;
    }

    if (!this.idade.trim()) {
      this.erro = 'Informe a idade aproximada do pet.';
      return;
    }

    if (!this.sexo) {
      this.erro = 'Selecione o sexo do pet.';
      return;
    }

    if (this.peso !== null && Number(this.peso) < 0) {
      this.erro = 'O peso não pode ser negativo.';
      return;
    }

    this.salvando = true;

    const dadosPet = {
      nome: this.nomePet.trim(),
      especie: this.especie === 'Outro' ? 'outro' : this.especie,
      outra_especie: this.especie === 'Outro' ? this.outraEspecie.trim() : null,
      idade: this.idade,
      sexo: this.sexo === 'Macho' ? 'M' : 'F',
      peso: this.peso !== null ? Number(this.peso) : null,
      foto_url: this.fotoPreview || null
    };

    this.http.post(`${environment.apiUrl}/user/listar/pet/cadastar`, dadosPet, { withCredentials: true })
      .subscribe({
        next: () => {
          this.sucesso = 'Pet cadastrado com sucesso.';
          this.modalCadastroAberto = false;
          this.limparFormularioCadastro();
          this.buscarPetsDoBanco();
        },
        error: (err) => {
          console.error('Erro ao cadastrar pet:', err);
          this.erro = err.error?.mensagem || 'Erro ao cadastrar o pet.';
          this.salvando = false;
        }
      });
  }

  editarPet(): void {
    if (!this.petSelecionado) return;

    this.petForm = { ...this.petSelecionado };
    this.editando = true;
  }

  salvarEdicao(): void {
    this.erro = '';
    this.sucesso = '';

    if (!this.petForm) return;

    if (!this.petForm.nome?.trim()) {
      this.erro = 'Informe o nome do pet.';
      return;
    }

    if (this.petForm.peso !== null && Number(this.petForm.peso) < 0) {
      this.erro = 'O peso não pode ser negativo.';
      return;
    }

    const dadosAtualizados = {
      nome: this.petForm.nome,
      especie: this.petForm.especie,
      outra_especie: this.petForm.outra_especie,
      sexo: this.petForm.sexo,
      idade: this.petForm.idade,
      peso: this.petForm.peso ? Number(this.petForm.peso) : null,
      observacoes: this.petForm.observacoes
    };

    this.http.put(`${environment.apiUrl}/user/listar/pet/editar/${this.petForm.id_pet}`, dadosAtualizados, { withCredentials: true })
      .subscribe({
        next: () => {
          this.sucesso = 'Informações atualizadas com sucesso.';
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
        next: () => {
          this.sucesso = 'Pet removido com sucesso.';
          this.buscarPetsDoBanco();
        },
        error: (err) => {
          console.error('Erro ao excluir pet:', err);
          this.erro = err.error?.mensagem || 'Não foi possível excluir o registro.';
        }
      });
  }
}