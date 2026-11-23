import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { mensagemDeErro } from '../../../core/utils/mensagem-erro';
import { formatarPreco, nomeDoPlano } from '../../../core/utils/formato-plano';
import { environment } from '../../../environments/environment';
import { DataMaskDirective } from './data-mask.directive';
import { IconePetComponent } from '../../../components/icone-pet/icone-pet.component';
import { PlanoCheckoutComponent } from '../../../components/plano-checkout/plano-checkout.component';
import { moeda } from '../../../core/utils/montar-plano';
import { PagamentoPendenteComponent } from '../../../components/pagamento-pendente/pagamento-pendente.component';

@Component({
  selector: 'app-listar-cadastro-pet',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, DataMaskDirective, IconePetComponent, PlanoCheckoutComponent, PagamentoPendenteComponent],
  templateUrl: './listar-cadastro-pet.component.html',
  styleUrl: './listar-cadastro-pet.component.css'
})
export class ListarCadastroPetComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;

  pets: any[] = [];
  petSelecionado: any = null;
  planosPorPet: Record<number, any> = {};
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

  // ---------- Cadastro em etapas (igual ao app) ----------
  // 3 etapas; com "Escolher um plano agora" ganha Plano e Pagamento
  etapa = 1;
  @ViewChild(PlanoCheckoutComponent) checkout?: PlanoCheckoutComponent;
  readonly moeda = moeda;

  // Depois de concluir: tela de processando / sucesso dentro da própria janela
  finalizacao: 'processando' | 'aguardando' | 'sucesso' | 'erro-plano' | null = null;
  metodoFinal: 'cartao' | 'pix' | 'boleto' = 'cartao';
  private idProdutoFinal = 0;
  resumoFinal: { pet: string; plano: string; ciclo: string; metodo: string; total: number; idPet: number | null } | null = null;

  get nomesEtapas(): string[] {
    const base = ['Identificação', 'Características', 'Sobre o pet'];
    return this.escolherPlano ? [...base, 'Plano', 'Pagamento'] : base;
  }
  raca = '';
  jeitinho: string[] = [];
  adora: string[] = [];
  bio = '';
  readonly limiteBio = 200;
  escolherPlano = false;

  readonly especies = [
    { valor: 'cachorro', texto: 'Cachorro' },
    { valor: 'gato', texto: 'Gato' },
    { valor: 'ave', texto: 'Ave' },
    { valor: 'coelho', texto: 'Coelho' },
    { valor: 'outro', texto: 'Outro' }
  ];

  readonly tracos = [
    { id: 'brincalhao', icone: 'sentiment_satisfied', macho: 'Brincalhão', femea: 'Brincalhona' },
    { id: 'carinhoso', icone: 'favorite', macho: 'Carinhoso', femea: 'Carinhosa' },
    { id: 'dorminhoco', icone: 'bedtime', macho: 'Dorminhoco', femea: 'Dorminhoca' },
    { id: 'sociavel', icone: 'group', macho: 'Sociável', femea: 'Sociável' },
    { id: 'agitado', icone: 'bolt', macho: 'Agitado', femea: 'Agitada' },
    { id: 'medroso', icone: 'thunderstorm', macho: 'Medroso', femea: 'Medrosa' }
  ];

  readonly gostos = [
    { id: 'passear', icone: 'directions_walk', texto: 'Passear' },
    { id: 'petiscos', icone: 'cookie', texto: 'Petiscos' },
    { id: 'bolinha', icone: 'sports_baseball', texto: 'Bolinha' },
    { id: 'agua', icone: 'water_drop', texto: 'Água' },
    { id: 'sofa', icone: 'weekend', texto: 'Sofá' }
  ];

  get ehMacho(): boolean {
    return this.sexo !== 'Fêmea';
  }

  textoTraco(t: { macho: string; femea: string }): string {
    return this.ehMacho ? t.macho : t.femea;
  }

  alternar(lista: string[], id: string): void {
    const i = lista.indexOf(id);
    if (i >= 0) lista.splice(i, 1); else lista.push(id);
  }

  private validarEtapa(n: number): boolean {
    this.erro = '';
    if (n === 1) {
      if (!this.nomePet.trim()) { this.exibirErro('Informe o nome do seu pet.'); return false; }
      if (!this.especie) { this.exibirErro('Escolha a espécie.'); return false; }
      if (this.especie === 'outro' && !this.outraEspecie.trim()) { this.exibirErro('Conte qual é a espécie.'); return false; }
    }
    if (n === 2) {
      if (!this.sexo) { this.exibirErro('Escolha o sexo.'); return false; }
      if (!this.dataPelaIdade(this.idadeAprox, this.unidadeIdade)) { this.exibirErro('Informe a idade aproximada do pet.'); return false; }
      if (this.peso === null || Number(this.peso) <= 0) { this.exibirErro('Informe o peso do pet.'); return false; }
    }
    return true;
  }

  avancarEtapa(): void {
    if (!this.validarEtapa(this.etapa)) return;
    if (this.etapa === 4) {
      const erro = this.checkout?.validarPlano() || '';
      if (erro) { this.exibirErro(erro); return; }
    }
    if (this.etapa < this.nomesEtapas.length) this.etapa++;
  }

  voltarEtapa(): void {
    this.erro = '';
    if (this.etapa > 1) this.etapa--;
  }

  // Junta raça, jeitinho, gostos e o texto livre nas observações do pet
  private montarObservacoes(): string {
    const partes: string[] = [];
    if (this.raca.trim()) partes.push(`Raça: ${this.raca.trim()}.`);
    const jeito = this.tracos.filter((t) => this.jeitinho.includes(t.id)).map((t) => this.textoTraco(t));
    if (jeito.length) partes.push(`Jeitinho: ${jeito.join(', ')}.`);
    const gosta = this.gostos.filter((g) => this.adora.includes(g.id)).map((g) => g.texto);
    if (gosta.length) partes.push(`Adora: ${gosta.join(', ')}.`);
    if (this.bio.trim()) partes.push(this.bio.trim());
    return partes.join(' ');
  }

  // Idade aproximada (igual ao app): número + anos/meses
  idadeAprox = '';
  unidadeIdade: 'anos' | 'meses' = 'anos';
  
  fotoPreview: string | ArrayBuffer | null = null;
  fotoArquivo: File | null = null;

  fotoPreviewEdicao: string | ArrayBuffer | null = null;
  fotoArquivoEdicao: File | null = null;

  erro = '';
  sucesso = '';

  constructor(private http: HttpClient, private router: Router) {}

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
        const planos: any[] = response?.planos || [];
        this.planosPorPet = {};
        planos.forEach((p: any) => {
          this.planosPorPet[p.id_pet] = {
            nome: nomeDoPlano(p.produto?.nome) || 'Plano',
            preco: `R$ ${formatarPreco(p.produto?.preco)}`,
            descricao: p.produto?.descricao
          };
        });
      },
      error: (err) => console.error(err)
    });
  }

  get planoContratado(): any {
    return this.petSelecionado ? this.planosPorPet[this.petSelecionado.id_pet] || null : null;
  }

  // ---------- Ajudantes do visual ----------

  selecionarPet(p: any): void {
    this.petSelecionado = p;
    this.erro = '';
    this.sucesso = '';
  }

  planoDoPet(p: any): any {
    return p ? this.planosPorPet[p.id_pet] || null : null;
  }

  get qtdComPlano(): number {
    return this.pets.filter((p) => this.planosPorPet[p.id_pet]).length;
  }

  // bronze, prata, ouro ou diamante (mesmas cores da página de admin)
  nivelDoPlano(p: any): string {
    const nome = String(this.planoDoPet(p)?.nome || '').toLowerCase();
    return ['bronze', 'prata', 'ouro', 'diamante'].find((n) => nome.includes(n)) || 'outro';
  }

  especieTexto(p: any): string {
    const e = p?.especie === 'outro' ? p?.outra_especie || 'Outro' : p?.especie || '';
    return e ? e.charAt(0).toUpperCase() + e.slice(1) : 'Pet';
  }

  sexoTexto(p: any): string {
    return p?.sexo === 'M' || p?.sexo === 'Macho' ? 'Macho' : 'Fêmea';
  }

  pesoTexto(p: any): string {
    const n = Number(p?.peso);
    return n > 0 ? `${n.toLocaleString('pt-BR')} kg` : '—';
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

  // ---------- Idade aproximada ----------

  soNumeros(valor: string): string {
    return String(valor || '').replace(/\D/g, '').slice(0, 2);
  }

  // Data de nascimento aproximada a partir da idade (o servidor guarda a data)
  private dataPelaIdade(valor: string, unidade: 'anos' | 'meses'): string | null {
    const n = parseInt(valor, 10);
    if (isNaN(n) || n < 0) return null;
    if (unidade === 'anos' && n > 35) return null;
    if (unidade === 'meses' && (n < 1 || n > 36)) return null;

    const d = new Date();
    if (unidade === 'anos') {
      d.setFullYear(d.getFullYear() - n);
    } else {
      d.setMonth(d.getMonth() - n);
    }
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T00:00:00.000Z`;
  }

  // Preenche o campo de idade na edição a partir da data salva
  private idadePelaData(dataISO: string): { valor: string; unidade: 'anos' | 'meses' } {
    const d = new Date(dataISO);
    if (!dataISO || isNaN(d.getTime())) return { valor: '', unidade: 'anos' };
    const hoje = new Date();
    let meses = (hoje.getFullYear() - d.getUTCFullYear()) * 12 + (hoje.getMonth() - d.getUTCMonth());
    if (hoje.getDate() < d.getUTCDate()) meses--;
    meses = Math.max(0, meses);
    return meses < 12
      ? { valor: String(Math.max(1, meses)), unidade: 'meses' }
      : { valor: String(Math.floor(meses / 12)), unidade: 'anos' };
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
    this.idadeAprox = '';
    this.unidadeIdade = 'anos';
    this.etapa = 1;
    this.raca = '';
    this.jeitinho = [];
    this.adora = [];
    this.bio = '';
    this.escolherPlano = false;
    this.finalizacao = null;
    this.resumoFinal = null;
    this.erro = '';
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

    // Confere as etapas anteriores e volta para a que tiver problema
    if (!this.validarEtapa(1)) { this.etapa = 1; return; }
    if (!this.validarEtapa(2)) { this.etapa = 2; return; }

    // Com plano: confere plano e pagamento antes de cadastrar
    if (this.escolherPlano) {
      const erroPlano = this.checkout?.validarPlano() ?? 'Escolha um plano.';
      if (erroPlano) { this.etapa = 4; this.exibirErro(erroPlano); return; }
      const erroPagamento = this.checkout?.validarPagamento() ?? '';
      if (erroPagamento) { this.etapa = 5; this.exibirErro(erroPagamento); return; }
    }

    if (!this.nomePet.trim()) return this.exibirErro('Informe o nome do pet.');
    if (!this.especie) return this.exibirErro('Selecione a espécie.');
    if (!this.sexo) return this.exibirErro('Selecione o sexo.');
    if (this.peso === null || Number(this.peso) <= 0) return this.exibirErro('Peso inválido.');

    const dataISO = this.dataPelaIdade(this.idadeAprox, this.unidadeIdade);
    if (!dataISO) return this.exibirErro('Informe a idade aproximada do pet.');

    this.salvando = true;
    const anosIdade = this.unidadeIdade === 'anos' ? parseInt(this.idadeAprox, 10) : 0;

    const formData = new FormData();
    formData.append('nome', this.nomePet.trim());
    formData.append('especie', this.especie === 'outro' ? 'outro' : this.especie.toLowerCase());
    formData.append('outra_especie', this.especie === 'outro' ? this.outraEspecie.trim() : '');
    formData.append('sexo', this.sexo === 'Macho' ? 'M' : 'F');
    formData.append('peso', this.peso.toString());
    formData.append('data_nascimento', dataISO.split('T')[0]);

    formData.append('idade', Math.max(0, anosIdade).toString());
    formData.append('observacoes', this.montarObservacoes());

    if (this.fotoArquivo) formData.append('image', this.fotoArquivo);

    this.http.post(`${environment.apiUrl}/user/listar/pet/cadastar`, formData, { withCredentials: true })
      .subscribe({
        next: (res: any) => {
          // Com plano: continua na janela, contrata e mostra a confirmação
          if (this.escolherPlano) {
            this.contratarPlanoDoNovoPet(res);
            return;
          }
          this.sucesso = 'Pet cadastrado com sucesso!';
          this.modalCadastroAberto = false;
          this.limparFormularioCadastro();
          this.buscarPetsDoBanco();
        },
        error: (err) => {
          this.exibirErro(mensagemDeErro(err, 'Erro ao cadastrar pet.'));
          this.salvando = false;
        }
      });
  }

  // Acha o pet recém-cadastrado e ativa o plano escolhido nas etapas 4 e 5
  private contratarPlanoDoNovoPet(resposta: any): void {
    const c = this.checkout;
    if (!c || !c.plano) { this.finalizacao = 'erro-plano'; this.salvando = false; return; }

    const nome = this.nomePet.trim();
    const idsAntes = new Set(this.pets.map((p) => p.id_pet));
    this.resumoFinal = {
      pet: nome,
      plano: c.plano.nome,
      ciclo: c.ciclo === 'anual' ? 'Anual' : 'Mensal',
      metodo: c.nomeMetodo,
      total: c.totalFinal,
      idPet: null
    };
    this.idProdutoFinal = Number(c.plano.id_produto);
    this.metodoFinal = c.metodo;
    this.finalizacao = 'processando';

    const ativar = (idPet: number | null) => {
      if (!idPet) { this.finalizacao = 'erro-plano'; this.salvando = false; return; }
      this.resumoFinal!.idPet = idPet;
      // Pix e boleto: mostra o QR Code / linha digitável e espera a confirmação
      if (this.metodoFinal !== 'cartao') {
        this.finalizacao = 'aguardando';
        return;
      }
      setTimeout(() => this.ativarPlanoDoNovoPet(), 1200);
    };

    const idDaResposta = Number(resposta?.id_pet ?? resposta?.pet?.id_pet ?? resposta?.Pet?.id_pet) || null;
    if (idDaResposta) { ativar(idDaResposta); return; }

    this.http.get<any>(`${environment.apiUrl}/user/listar/pet`, { withCredentials: true }).subscribe({
      next: (r) => {
        const lista: any[] = r?.pets || r?.Pets || [];
        const novos = lista.filter((p) => !idsAntes.has(p.id_pet));
        const novo = novos.find((p) => String(p.nome).trim() === nome) || novos[novos.length - 1]
          || [...lista].filter((p) => String(p.nome).trim() === nome).sort((a, b) => b.id_pet - a.id_pet)[0];
        ativar(novo?.id_pet ?? null);
      },
      error: () => ativar(null)
    });
  }

  ativarPlanoDoNovoPet(): void {
    const idPet = this.resumoFinal?.idPet;
    if (!idPet) { this.finalizacao = 'erro-plano'; return; }
    this.http.post(`${environment.apiUrl}/user/planos/pagamento`, { id_produto: this.idProdutoFinal, id_pet: idPet }, { withCredentials: true })
      .subscribe({
        next: () => { this.finalizacao = 'sucesso'; this.salvando = false; },
        error: () => { this.finalizacao = 'erro-plano'; this.salvando = false; }
      });
  }

  concluirFinalizacao(): void {
    const id = this.resumoFinal?.idPet;
    this.modalCadastroAberto = false;
    this.limparFormularioCadastro();
    this.buscarPetsDoBanco();
    this.buscarPlanoAtivoReal();
    if (id) setTimeout(() => this.petSelecionado = this.pets.find((p) => p.id_pet === id) || this.petSelecionado, 600);
  }

  editarPet(): void {
    if (!this.petSelecionado) return;
    this.petForm = { ...this.petSelecionado };
    this.petForm.dataNascimentoInput = this.formatarParaDataBR(this.petForm.data_nascimento);
    const idade = this.idadePelaData(this.petForm.data_nascimento);
    this.petForm.idadeAprox = idade.valor;
    this.petForm.unidadeIdade = idade.unidade;
    this.petForm.idadeOriginal = `${idade.valor} ${idade.unidade}`;
    
    this.fotoPreviewEdicao = this.petSelecionado.foto_url;
    this.fotoArquivoEdicao = null;

    this.editando = true;
    this.erro = '';
  }

  salvarEdicao(): void {
    this.erro = '';
    if (!this.petForm.nome?.trim()) return this.exibirErro('Informe o nome do pet.');
    
    // Se a idade não mudou, mantém a data de nascimento que já estava salva
    const idadeIgual = `${this.petForm.idadeAprox} ${this.petForm.unidadeIdade}` === this.petForm.idadeOriginal;
    const dataISO = idadeIgual && this.petForm.data_nascimento
      ? this.petForm.data_nascimento
      : this.dataPelaIdade(this.petForm.idadeAprox, this.petForm.unidadeIdade);
    if (!dataISO) return this.exibirErro('Informe a idade aproximada do pet.');

    this.salvando = true;
    const anosIdade = Math.floor(
      (Date.now() - new Date(dataISO).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    );

    const formData = new FormData();
    formData.append('nome', this.petForm.nome.trim());
    formData.append('especie', this.petForm.especie.toLowerCase());
    formData.append('outra_especie', this.petForm.especie === 'outro' ? (this.petForm.outra_especie || '') : '');
    formData.append('sexo', this.petForm.sexo);
    formData.append('peso', this.petForm.peso ? this.petForm.peso.toString() : '');
    formData.append('data_nascimento', dataISO.split('T')[0]);
    formData.append('observacoes', this.petForm.observacoes || '');

    formData.append('idade', Math.max(0, anosIdade).toString());

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
        error: (err) => this.exibirErro(mensagemDeErro(err, 'Não foi possível excluir o registro.'))
      });
  }

  private exibirErro(msg: string) {
    this.erro = msg;
  }
}