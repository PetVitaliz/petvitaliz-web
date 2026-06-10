import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
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
  @ViewChild('fileInput') fileInput!: ElementRef;

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
  idade: string | number = '';
  sexo = '';
  peso: number | null = null;
  
  fotoPreview: string | ArrayBuffer | null = null;
  fotoArquivo: File | null = null;

  fotoPreviewEdicao: string | ArrayBuffer | null = null;
  fotoArquivoEdicao: File | null = null;

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
          if (this.pets.length > 0) {
             const petAindaExiste = this.pets.find(p => p.id_pet === this.petSelecionado?.id_pet);
             this.petSelecionado = petAindaExiste || this.pets[0];
          } else {
             this.petSelecionado = null;
          }
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

    const dataObj = new Date(dataNasc);
    if (isNaN(dataObj.getTime())) return 'Idade desconhecida';

    // Usar os métodos UTC blinda a função contra o fuso horário do usuário
    const anoNasc = dataObj.getUTCFullYear();
    const mesNasc = dataObj.getUTCMonth(); 
    const diaNasc = dataObj.getUTCDate();

    const hoje = new Date();
    const anoAtual = hoje.getFullYear();
    const mesAtual = hoje.getMonth();
    const diaAtual = hoje.getDate();

    let anos = anoAtual - anoNasc;
    let meses = mesAtual - mesNasc;

    if (meses < 0 || (meses === 0 && diaAtual < diaNasc)) {
      anos--;
      meses += 12;
    }

    if (diaAtual < diaNasc && meses > 0) {
      meses--;
    }

    if (anos <= 0 && meses <= 0) return 'Recém-nascido';

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
    this.idade = ''; 
    this.sexo = '';
    this.peso = null;
    this.fotoPreview = null;
    this.fotoArquivo = null;
    this.salvando = false;
    
    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
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

  carregarFotoEdicao(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const arquivo = input.files[0];
    this.fotoArquivoEdicao = arquivo;
    const reader = new FileReader();
    reader.onload = () => this.fotoPreviewEdicao = reader.result;
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
    formData.append('especie', this.especie === 'outro' ? 'outro' : this.especie.toLowerCase());
    formData.append('outra_especie', this.especie === 'outro' ? this.outraEspecie.trim() : '');
    formData.append('sexo', this.sexo === 'Macho' ? 'M' : 'F');
    formData.append('peso', this.peso.toString());
    formData.append('data_nascimento', dataISO.split('T')[0]);

    const idadeFinal = this.idade ? this.idade.toString() : Math.max(0, anosIdade).toString();
    formData.append('idade', idadeFinal);

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
    
    this.fotoPreviewEdicao = this.petSelecionado.foto_url;
    this.fotoArquivoEdicao = null;

    this.editando = true;
    this.erro = '';
  }

  salvarEdicao(): void {
    this.erro = '';
    if (!this.petForm.nome?.trim()) return this.exibirErro('Informe o nome do pet.');
    
    const dataISO = this.converterParaISO(this.petForm.dataNascimentoInput);
    if (!dataISO) return this.exibirErro('Data de nascimento inválida.');

    this.salvando = true;
    const anosIdade = new Date().getFullYear() - new Date(dataISO).getFullYear();

    const formData = new FormData();
    formData.append('nome', this.petForm.nome.trim());
    formData.append('especie', this.petForm.especie.toLowerCase());
    formData.append('outra_especie', this.petForm.especie === 'outro' ? (this.petForm.outra_especie || '') : '');
    formData.append('sexo', this.petForm.sexo);
    formData.append('peso', this.petForm.peso ? this.petForm.peso.toString() : '');
    formData.append('data_nascimento', dataISO.split('T')[0]);
    formData.append('observacoes', this.petForm.observacoes || '');

    const idadeFinal = this.petForm.idade ? this.petForm.idade.toString() : Math.max(0, anosIdade).toString();
    formData.append('idade', idadeFinal);

    if (this.fotoArquivoEdicao) {
      formData.append('image', this.fotoArquivoEdicao);
    }

    this.http.put(`${environment.apiUrl}/user/listar/pet/editar/${this.petForm.id_pet}`, formData, { withCredentials: true })
      .subscribe({
        next: () => {
          this.sucesso = 'Informações atualizadas com sucesso.';
          this.editando = false;
          this.salvando = false;
          this.buscarPetsDoBanco();
        },
        error: (err) => {
          this.exibirErro(err.error?.mensagem || 'Erro ao atualizar dados.');
          this.salvando = false;
        }
      });
  }

  cancelarEdicao() { 
    this.editando = false; 
    this.petForm = {}; 
    this.fotoPreviewEdicao = null;
    this.fotoArquivoEdicao = null;
  }

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
  }
}