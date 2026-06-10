import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
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
  modalCadastroAberto = false;
  salvando = false;

  petForm: any = {};

  nomePet = '';
  especie = '';
  outraEspecie = '';
  dataNascimentoInput = '';
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
    this.buscarPlanoAtivoReal();
  }

  carregarDadosLocais(): void {
    this.usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado') || 'null');
  }

  buscarPetsDoBanco(): void {
    this.http.get<any>(`${environment.apiUrl}/user/listar/pet`, { withCredentials: true })
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
    this.http.get<any>(`${environment.apiUrl}/user/planos`, { withCredentials: true }).subscribe({
      next: (response: any) => {
        if (response && response.tem_plano && response.include) {
          const partesNome = response.include.nome ? response.include.nome.split(' | ') : ['Plano'];
          this.planoContratado = {
            nome: partesNome[0],
            preco: `R$ ${response.include.preco}`,
            descricao: response.include.descricao
          };
        } else {
          this.planoContratado = null;
        }
      },
      error: (err) => console.error(err)
    });
  }

  get nomeTutor(): string { return this.usuarioLogado?.nome || 'Responsável'; }
  get emailTutor(): string { return this.usuarioLogado?.email || 'E-mail não informado'; }

  calcularPortePet(especie: string, peso: any): string {
    const p = Number(peso);
    if (!p || isNaN(p) || p <= 0) return 'Indefinido';
    const esp = especie.toLowerCase();

    if (esp === 'cachorro') {
      if (p <= 5) return 'Pequeno';
      if (p <= 10) return 'Pequeno';
      if (p <= 25) return 'Médio';
      if (p <= 45) return 'Grande';
      return 'Gigante';
    }

    if (esp === 'gato') {
      if (p <= 3.5) return 'Pequeno';
      if (p <= 5.5) return 'Médio';
      if (p <= 8) return 'Grande';
      return 'Gigante';
    }

    if (esp === 'coelho') {
      if (p < 1.5) return 'Anão';
      if (p <= 3) return 'Pequeno';
      if (p <= 5) return 'Médio';
      return 'Grande';
    }

    if (esp === 'ave') {
      if (p <= 1) return 'Pequeno';
      if (p <= 4) return 'Médio';
      if (p <= 10) return 'Grande';
      return 'Gigante';
    }

    return 'N/A';
  }

  obterIdadeExtenso(dataNasc: string): string {
    if (!dataNasc) return 'Idade desconhecida';
    
    const hoje = new Date();
    const nascimento = new Date(dataNasc);
    
    let anos = hoje.getFullYear() - nascimento.getFullYear();
    let meses = hoje.getMonth() - nascimento.getMonth();
    
    if (meses < 0 || (meses === 0 && hoje.getDate() < nascimento.getDate())) {
      anos--;
      meses += 12;
    }
    if (hoje.getDate() < nascimento.getDate() && meses > 0) {
      meses--;
    }

    if (anos === 0 && meses === 0) return 'Recém-nascido';
    
    const textoAnos = anos > 0 ? `${anos} ${anos === 1 ? 'ano' : 'anos'}` : '';
    const textoMeses = meses > 0 ? `${meses} ${meses === 1 ? 'mês' : 'meses'}` : '';
    
    if (textoAnos && textoMeses) return `${textoAnos} e ${textoMeses}`;
    return textoAnos || textoMeses;
  }

  formatarParaDataBR(dataISO: string): string {
    if (!dataISO) return '';
    const partes = dataISO.split('T')[0].split('-');
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  converterParaISO(dataBR: string): string | null {
    const partes = dataBR.split('/');
    if (partes.length !== 3) return null;
    
    const dia = parseInt(partes[0], 10);
    const mes = parseInt(partes[1], 10);
    const ano = parseInt(partes[2], 10);
    
    const dataObj = new Date(ano, mes - 1, dia);
    if (dataObj.getFullYear() !== ano || dataObj.getMonth() !== mes - 1 || dataObj.getDate() !== dia) {
      return null;
    }
    return `${ano}-${String(mes).padStart(2,'0')}-${String(dia).padStart(2,'0')}T00:00:00.000Z`;
  }

  abrirCadastroPet(): void {
    this.erro = '';
    this.sucesso = '';
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
    this.dataNascimentoInput = '';
    this.sexo = '';
    this.peso = null;
    this.fotoPreview = null;
    this.fotoArquivo = null;
    this.salvando = false;
  }

  carregarFoto(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const arquivo = input.files[0];
    this.fotoArquivo = arquivo;
    const reader = new FileReader();
    reader.onload = () => this.fotoPreview = reader.result;
    reader.readAsDataURL(arquivo);
  }

  confirmarCadastro(): void {
    this.erro = '';
    this.sucesso = '';

    if (!this.nomePet.trim()) return this.exibirErro('Informe o nome do pet.');
    if (!this.especie) return this.exibirErro('Selecione a espécie.');
    if (!this.sexo) return this.exibirErro('Selecione o sexo.');
    if (this.peso === null || Number(this.peso) <= 0) return this.exibirErro('Peso inválido.');

    const dataISO = this.converterParaISO(this.dataNascimentoInput);
    if (!dataISO) return this.exibirErro('Insira uma data de nascimento válida (DD/MM/AAAA).');

    this.salvando = true;

    const anosIdade = new Date().getFullYear() - new Date(dataISO).getFullYear();

    const formData = new FormData();
    formData.append('nome', this.nomePet.trim());
    formData.append('especie', this.especie === 'Outro' ? 'outro' : this.especie.toLowerCase());
    formData.append('outra_especie', this.especie === 'Outro' ? this.outraEspecie.trim() : '');
    formData.append('sexo', this.sexo === 'Macho' ? 'M' : 'F');
    formData.append('idade', Math.max(0, anosIdade).toString());
    formData.append('peso', this.peso.toString());
    formData.append('data_nascimento', dataISO.split('T')[0]);

    if (this.fotoArquivo) formData.append('image', this.fotoArquivo);

    this.http.post(`${environment.apiUrl}/user/listar/pet/cadastar`, formData, { withCredentials: true })
      .subscribe({
        next: () => {
          this.sucesso = 'Pet cadastrado com sucesso!';
          this.modalCadastroAberto = false;
          this.limparFormularioCadastro();
          this.buscarPetsDoBanco();
        },
        error: (err) => {
          this.exibirErro(err.error || 'Erro ao cadastrar pet.');
          this.salvando = false;
        }
      });
  }

  editarPet(): void {
    if (!this.petSelecionado) return;
    this.petForm = { ...this.petSelecionado };
    this.petForm.dataNascimentoInput = this.formatarParaDataBR(this.petForm.data_nascimento);
    this.editando = true;
    this.erro = '';
  }

  salvarEdicao(): void {
    this.erro = '';
    if (!this.petForm.nome?.trim()) return this.exibirErro('Informe o nome do pet.');
    
    const dataISO = this.converterParaISO(this.petForm.dataNascimentoInput);
    if (!dataISO) return this.exibirErro('Data de nascimento inválida.');

    const anosIdade = new Date().getFullYear() - new Date(dataISO).getFullYear();

    const dadosAtualizados = {
      nome: this.petForm.nome.trim(),
      especie: this.petForm.especie.toLowerCase(),
      outra_especie: this.petForm.especie === 'outro' ? this.petForm.outra_especie : null,
      sexo: this.petForm.sexo,
      idade: Math.max(0, anosIdade),
      peso: Number(this.petForm.peso),
      data_nascimento: dataISO.split('T')[0],
      observacoes: this.petForm.observacoes || ''
    };

    this.http.put(`${environment.apiUrl}/user/listar/pet/editar/${this.petForm.id_pet}`, dadosAtualizados, { withCredentials: true })
      .subscribe({
        next: () => {
          this.sucesso = 'Informações atualizadas com sucesso.';
          this.editando = false;
          this.buscarPetsDoBanco();
        },
        error: (err) => this.exibirErro(err.error?.mensagem || 'Erro ao atualizar dados.')
      });
  }

  cancelarEdicao() { this.editando = false; this.petForm = {}; }

  excluirPet(): void {
    if (!this.petSelecionado || !confirm(`Excluir o histórico de ${this.petSelecionado.nome}?`)) return;
    this.http.delete(`${environment.apiUrl}/user/listar/pet/delete/${this.petSelecionado.id_pet}`, { withCredentials: true })
      .subscribe({
        next: () => { this.sucesso = 'Pet removido.'; this.buscarPetsDoBanco(); },
        error: (err) => this.exibirErro('Não foi possível excluir o registro.')
      });
  }

  private exibirErro(msg: string) {
    this.erro = msg;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}