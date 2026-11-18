import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { DataMaskDirective } from './data-mask.directive';

@Component({
  selector: 'app-perfil-funcionario',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DataMaskDirective],
  templateUrl: './perfil-funcionario.component.html',
  styleUrl: './perfil-funcionario.component.css'
})
export class PerfilFuncionarioComponent implements OnInit {

  fotoPerfil = '';

  carregando = true;
  editando = false;
  salvando = false;

  erroMensagem = '';
  toastMensagem = '';

  especialidade = '';

  funcionario = {
    nome: '',
    sobrenome: '',
    cargo: 'Funcionário',
    crmv: '',
    email: '',
    telefone: '',
    nascimento: ''
  };

  dadosTemp = { ...this.funcionario };

  // Números reais, calculados a partir das consultas do funcionário
  carregandoResumo = true;
  resumo = { total: 0, hoje: 0, emEspera: 0, finalizadas: 0 };

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.fotoPerfil = localStorage.getItem('fotoFuncionario') || '';
    this.buscarDadosPerfil();
    this.carregarResumo();
  }

  buscarDadosPerfil(): void {
    this.carregando = true;
    this.http.get<any>(`${environment.apiUrl}/funcionario/perfil-dados`, { withCredentials: true }).subscribe({
      next: (dados) => {
        this.carregando = false;
        this.especialidade = dados.especialidade || '';
        this.funcionario = {
          nome: dados.nome || '',
          sobrenome: dados.sobrenome || '',
          cargo: dados.especialidade === 'veterinario' ? 'Veterinário(a)' : this.capitalizar(dados.especialidade || 'Funcionário'),
          crmv: dados.crmv || '',
          email: dados.email || '',
          telefone: dados.telefone || '',
          nascimento: localStorage.getItem('nascimento_fun') || ''
        };

        if (dados.foto_url) {
          this.fotoPerfil = dados.foto_url;
        }

        this.dadosTemp = { ...this.funcionario };
      },
      error: (err) => {
        this.carregando = false;
        console.error('Erro ao carregar perfil do funcionário:', err);
        this.erroMensagem = 'Não foi possível carregar seus dados.';
      }
    });
  }

  carregarResumo(): void {
    this.carregandoResumo = true;
    this.http.get<any>(`${environment.apiUrl}/funcionario/consultas`, { withCredentials: true }).subscribe({
      next: (res) => {
        this.carregandoResumo = false;
        const consultas: any[] = Array.isArray(res?.consultas) ? res.consultas : [];
        const hoje = this.hojeISO();
        const status = (c: any) => String(c.status || '').trim().toLowerCase();

        this.resumo = {
          total: consultas.length,
          hoje: consultas.filter(c => String(c.data_consulta || '').split('T')[0] === hoje).length,
          emEspera: consultas.filter(c => status(c) === 'em_espera' || status(c) === 'em espera').length,
          finalizadas: consultas.filter(c => status(c) === 'finalizado').length
        };
      },
      error: (err) => {
        this.carregandoResumo = false;
        console.error('Erro ao carregar resumo de consultas:', err);
      }
    });
  }

  get nomeCompleto(): string {
    return `${this.funcionario.nome} ${this.funcionario.sobrenome}`.trim() || 'Carregando...';
  }

  get iniciais(): string {
    const n = this.funcionario.nome?.charAt(0) || 'F';
    const s = this.funcionario.sobrenome?.charAt(0) || '';
    return (n + s).toUpperCase();
  }

  get ehVeterinario(): boolean {
    return this.especialidade === 'veterinario';
  }

  alterarFoto(event: Event): void {
    const input = event.target as HTMLInputElement;
    const arquivo = input.files?.[0];
    if (!arquivo) return;

    if (!arquivo.type.startsWith('image/')) {
      this.erroMensagem = 'Escolha um arquivo de imagem (JPG, PNG ou WEBP).';
      return;
    }

    if (arquivo.size > 2 * 1024 * 1024) {
      this.erroMensagem = 'A imagem precisa ter no máximo 2 MB.';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.fotoPerfil = reader.result as string;
      localStorage.setItem('fotoFuncionario', this.fotoPerfil);
      window.dispatchEvent(new Event('fotoFuncionarioAtualizada'));
      this.mostrarToast('Foto atualizada.');
    };
    reader.readAsDataURL(arquivo);
    input.value = '';
  }

  habilitarEdicao(): void {
    this.erroMensagem = '';
    this.editando = true;
    this.dadosTemp = { ...this.funcionario };
  }

  cancelarEdicao(): void {
    this.dadosTemp = { ...this.funcionario };
    this.editando = false;
    this.erroMensagem = '';
  }

  salvarEdicao(): void {
    if (!this.dadosTemp.nome.trim()) {
      this.erroMensagem = 'O nome é obrigatório.';
      return;
    }

    if (this.dadosTemp.nascimento && !/^\d{2}\/\d{2}\/\d{4}$/.test(this.dadosTemp.nascimento)) {
      this.erroMensagem = 'Informe a data de nascimento no formato DD/MM/AAAA.';
      return;
    }

    // A data de nascimento ainda não existe na API: fica salva neste navegador
    if (this.dadosTemp.nascimento) {
      localStorage.setItem('nascimento_fun', this.dadosTemp.nascimento);
    } else {
      localStorage.removeItem('nascimento_fun');
    }

    const payload = {
      nome: this.dadosTemp.nome.trim(),
      sobrenome: this.dadosTemp.sobrenome.trim(),
      email: this.funcionario.email.trim(),
      telefone: this.dadosTemp.telefone ? this.dadosTemp.telefone.trim() : null
    };

    this.salvando = true;
    this.erroMensagem = '';
    this.http.put<any>(`${environment.apiUrl}/funcionario/perfil-dados/atualizar`, payload, { withCredentials: true }).subscribe({
      next: (res) => {
        this.salvando = false;
        this.editando = false;
        this.mostrarToast(res?.mensagem || 'Dados atualizados com sucesso.');
        this.buscarDadosPerfil();
      },
      error: (err) => {
        this.salvando = false;
        console.error('Erro ao atualizar perfil no servidor:', err);
        this.erroMensagem = err.error?.mensagem || 'Não foi possível salvar as alterações.';
      }
    });
  }

  private mostrarToast(mensagem: string): void {
    this.toastMensagem = mensagem;
    setTimeout(() => (this.toastMensagem = ''), 3000);
  }

  private capitalizar(texto: string): string {
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }

  private hojeISO(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
}