import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

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
  porte = '';

  fotoPreview: string | ArrayBuffer | null = null;
  fotoArquivo: File | null = null;

  erro = '';
  sucesso = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.carregarDadosLocais();
    this.buscarPetsDoBanco();
    this.buscarPlanoAtivoReal();
  }

  carregarDadosLocais(): void {
    this.usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado') || 'null');
  }

  buscarPetsDoBanco(): void {
    this.http.get(`${environment.apiUrl}/user/listar/pet`, { withCredentials: true })
      .subscribe({
        next: (response: any) => {
          this.pets = response.Pets || response.pets || [];
          this.petSelecionado = this.pets.length > 0 ? this.pets[0] : null;
        },
        error: (err) => {
          console.error('Erro ao buscar pets:', err);
          this.exibirErro('Não foi possível carregar a lista de pets.');
        }
      });
  }

  buscarPlanoAtivoReal(): void {
    this.http.get(`${environment.apiUrl}/user/planos`, { withCredentials: true }).subscribe({
      next: (response: any) => {
        if (response && response.tem_plano && response.include) {
          const partesNome = response.include.nome ? response.include.nome.split(' | ') : ['Plano'];
          
          this.planoContratado = {
            nome: partesNome[0],
            preco: `R$ ${response.include.preco}`,
            descricao: response.include.descricao
          };
          
          localStorage.setItem('planoSelecionado', JSON.stringify(this.planoContratado));
        } else {
          this.planoContratado = null;
          localStorage.removeItem('planoSelecionado');
        }
      },
      error: (err) => {
        console.error('Erro ao buscar plano ativo do pet:', err);
        this.planoContratado = null;
        localStorage.removeItem('planoSelecionado');
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
    this.porte = '';
    this.fotoPreview = null;
    this.fotoArquivo = null;
    this.salvando = false;
  }

  carregarFoto(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const arquivo = input.files[0];

    if (!arquivo.type.startsWith('image/')) {
      this.exibirErro('Selecione uma imagem válida.');
      return;
    }

    if (arquivo.size > 5 * 1024 * 1024) {
      this.exibirErro('A imagem deve ter no máximo 5MB.');
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
      return this.exibirErro('Informe o nome do pet.');
    }

    if (!this.especie) {
      return this.exibirErro('Selecione a espécie do pet.');
    }

    if (this.especie === 'Outro' && !this.outraEspecie.trim()) {
      return this.exibirErro('Informe qual é a espécie.');
    }

    if (!this.sexo) {
      return this.exibirErro('Selecione o sexo do pet.');
    }

    if (!this.idade) {
      return this.exibirErro('Informe a idade do pet.');
    }

    if (!this.porte) {
      return this.exibirErro('Selecione o porte do pet.');
    }

    const numeroIdade = parseInt(this.idade.replace(/\D/g, ''), 10);

    if (isNaN(numeroIdade)) {
      return this.exibirErro('A idade deve conter um número válido.');
    }

    const pesoConvertido = this.converterPorteParaPeso(this.porte);

    if (pesoConvertido <= 0) {
      return this.exibirErro('Selecione um porte válido.');
    }

    this.salvando = true;

    const anoAtual = new Date().getFullYear();
    const dataNascimentoCalculada = `${anoAtual - numeroIdade}-01-01`;

    const formData = new FormData();

    formData.append('nome', this.nomePet.trim());
    formData.append('especie', this.especie === 'Outro' ? 'outro' : this.especie.toLowerCase());
    formData.append('outra_especie', this.especie === 'Outro' ? this.outraEspecie.trim() : '');
    formData.append('sexo', this.sexo === 'Macho' ? 'M' : 'F');
    formData.append('idade', numeroIdade.toString());
    formData.append('porte', this.porte);
    formData.append('peso', pesoConvertido.toString());
    formData.append('data_nascimento', dataNascimentoCalculada);

    if (this.fotoArquivo) {
      formData.append('image', this.fotoArquivo);
    }

    this.http.post(`${environment.apiUrl}/user/listar/pet/cadastar`, formData, { withCredentials: true })
      .subscribe({
        next: () => {
          this.sucesso = 'Pet cadastrado com sucesso!';
          this.modalCadastroAberto = false;
          this.limparFormularioCadastro();
          this.buscarPetsDoBanco();
        },
        error: (err) => {
          console.error(err);
          this.exibirErro(err.error?.mensagem || err.error || 'Erro ao cadastrar o pet.');
          this.salvando = false;
        }
      });
  }

  editarPet(): void {
    if (!this.petSelecionado) {
      return;
    }

    this.petForm = { ...this.petSelecionado };

    if (!this.petForm.porte && this.petForm.peso) {
      this.petForm.porte = this.converterPesoParaPorte(Number(this.petForm.peso));
    }

    this.editando = true;
    this.erro = '';
  }

  salvarEdicao(): void {
    this.erro = '';

    if (!this.petForm.nome?.trim()) {
      return this.exibirErro('Informe o nome do pet.');
    }

    if (!this.petForm.porte) {
      return this.exibirErro('Selecione o porte do pet.');
    }

    const numeroIdade = typeof this.petForm.idade === 'string'
      ? parseInt(this.petForm.idade.replace(/\D/g, ''), 10)
      : this.petForm.idade;

    if (isNaN(numeroIdade)) {
      return this.exibirErro('Idade inválida.');
    }

    const pesoConvertido = this.converterPorteParaPeso(this.petForm.porte);

    if (pesoConvertido <= 0) {
      return this.exibirErro('Selecione um porte válido.');
    }

    const anoAtual = new Date().getFullYear();
    const dataNascimentoCalculada = `${anoAtual - numeroIdade}-01-01`;

    const dadosAtualizados = {
      nome: this.petForm.nome.trim(),
      especie: this.petForm.especie.toLowerCase(),
      outra_especie: this.petForm.especie === 'outro' ? this.petForm.outra_especie : null,
      sexo: this.petForm.sexo,
      idade: numeroIdade,
      porte: this.petForm.porte,
      peso: pesoConvertido,
      data_nascimento: dataNascimentoCalculada,
      observacoes: this.petForm.observacoes || ''
    };

    this.http.put(`${environment.apiUrl}/user/listar/pet/editar/${this.petForm.id_pet}`, dadosAtualizados, { withCredentials: true })
      .subscribe({
        next: () => {
          this.sucesso = 'Informações updated com sucesso.';
          this.editando = false;
          this.buscarPetsDoBanco();
        },
        error: (err) => {
          console.error(err);
          this.exibirErro(err.error?.mensagem || 'Erro ao atualizar os dados do pet.');
        }
      });
  }

  cancelarEdicao(): void {
    this.editando = false;
    this.petForm = {};
    this.erro = '';
  }

  excluirPet(): void {
    if (!this.petSelecionado) {
      return;
    }

    if (!confirm(`Deseja realmente excluir o histórico de ${this.petSelecionado.nome}?`)) {
      return;
    }

    this.http.delete(`${environment.apiUrl}/user/listar/pet/delete/${this.petSelecionado.id_pet}`, { withCredentials: true })
      .subscribe({
        next: () => {
          this.sucesso = 'Pet removido com sucesso.';
          this.buscarPetsDoBanco();
        },
        error: (err) => {
          console.error(err);
          this.exibirErro(err.error?.mensagem || 'Não foi possível excluir o registro.');
        }
      });
  }

  converterPorteParaPeso(porte: string): number {
    if (porte === 'Pequeno') {
      return 8;
    }

    if (porte === 'Médio') {
      return 15;
    }

    if (porte === 'Grande') {
      return 25;
    }

    return 0;
  }

  converterPesoParaPorte(peso: number): string {
    if (peso <= 9) {
      return 'Pequeno';
    }

    if (peso <= 17) {
      return 'Médio';
    }

    return 'Grande';
  }

  private exibirErro(msg: string): void {
    this.erro = msg;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}