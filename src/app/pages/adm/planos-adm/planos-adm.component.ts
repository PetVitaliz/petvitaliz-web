import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface Plano {
  id_produto?: number;
  nome: string;
  descricao: string;
  beneficios: string;
  beneficiosArray?: string[];
  preco: number | string;
  tag: string;
  status: 'Ativo' | 'Inativo';
}

@Component({
  selector: 'app-planos-adm',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './planos-adm.component.html',
  styleUrl: './planos-adm.component.css'
})
export class PlanosAdmComponent implements OnInit {

  modalAberto = false;
  modalDetalhesAberto = false;
  modoEdicao = false;
  salvando = false;

  mensagemErro = '';
  mensagemSucesso = '';

  planos: Plano[] = [];
  planoSelecionado: Plano = this.criarPlanoVazio();
  planoDetalhes: Plano | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.carregarPlanos();
  }

  carregarPlanos(): void {
    this.http.get(`${environment.apiUrl}/adm/listar/produtos`, { withCredentials: true }).subscribe({
      next: (response: any) => {
        if (response && response.produtos) {
          this.planos = response.produtos.map((p: any) => {
            const partesNome = p.nome.split(' | ');
            const nomeReal = partesNome[0];
            const tagReal = partesNome[1] || 'NÍVEL DE ENTRADA';

            return {
              id_produto: p.id_produto,
              nome: nomeReal,
              descricao: p.descricao,
              beneficios: p.beneficios || '',
              tag: tagReal,
              status: 'Ativo', 
              preco: p.preco,
              beneficiosArray: p.beneficios
                ? p.beneficios.split(/[\n,;]+/).map((b: string) => b.trim()).filter((b: string) => b.length > 0)
                : []
            };
          });
        }
      },
      error: (err) => console.error('Erro ao buscar planos:', err)
    });
  }

  novoPlano(): void {
    this.mensagemErro = '';
    this.mensagemSucesso = '';

    if (this.planos.length >= 4) {
      alert('Limite máximo atingido O sistema do PetVitaliz permite apenas 4 planos ativos simultâneos na Home.');
      return;
    }

    this.modoEdicao = false;
    this.planoSelecionado = this.criarPlanoVazio();
    this.modalAberto = true;
  }

  editarPlano(plano: Plano): void {
    this.modoEdicao = true;
    this.mensagemErro = '';
    this.mensagemSucesso = '';
    this.planoSelecionado = { ...plano };
    this.modalAberto = true;
  }

  salvarPlano(): void {
    this.mensagemErro = '';
    this.mensagemSucesso = '';

    if (!this.planoSelecionado.nome || !this.planoSelecionado.preco || !this.planoSelecionado.descricao) {
      this.mensagemErro = 'Preencha os campos obrigatórios (Nome, Preço e Descrição).';
      return;
    }

    const tagJaExiste = this.planos.some(p => 
      p.tag === this.planoSelecionado.tag && p.id_produto !== this.planoSelecionado.id_produto
    );

    if (tagJaExiste) {
      this.mensagemErro = `A tag categoria "${this.planoSelecionado.tag}" já está em uso por outro plano.`;
      return;
    }

    this.salvando = true;

    const nomeComTagfused = `${this.planoSelecionado.nome.trim()} | ${this.planoSelecionado.tag}`;

    const payload = {
      nome: nomeComTagfused,
      descricao: this.planoSelecionado.descricao.trim(),
      beneficios: this.planoSelecionado.beneficios.trim(),
      preco: Number(this.planoSelecionado.preco)
    };

    if (this.modoEdicao && this.planoSelecionado.id_produto) {
      this.http.put(`${environment.apiUrl}/adm/listar/produtos/editar/${this.planoSelecionado.id_produto}`, payload, { withCredentials: true })
        .subscribe({
          next: () => {
            this.mensagemSucesso = 'Plano de assinatura atualizado com sucesso';
            setTimeout(() => this.finalizarSalvar(), 1200);
          },
          error: (err) => this.tratarErro(err)
        });
    } else {
      this.http.post(`${environment.apiUrl}/adm/listar/produtos/cadastrar`, payload, { withCredentials: true })
        .subscribe({
          next: () => {
            this.mensagemSucesso = 'Novo plano registrado com sucesso';
            setTimeout(() => this.finalizarSalvar(), 1200);
          },
          error: (err) => this.tratarErro(err)
        });
    }
  }

  excluirPlano(id: number | undefined): void {
    if (!id) return;
    
    if (confirm('Tem certeza que deseja excluir permanentemente este plano?')) {
      this.http.delete(`${environment.apiUrl}/adm/listar/produtos/excluir/${id}`, { withCredentials: true })
        .subscribe({
          next: () => {
            this.carregarPlanos();
          },
          error: (err) => console.error('Erro ao excluir plano:', err)
        });
    }
  }

  private finalizarSalvar() {
    this.modalAberto = false;
    this.salvando = false;
    this.carregarPlanos();
  }

  private tratarErro(err: any) {
    this.salvando = false;
    console.error(err);
    this.mensagemErro = typeof err.error === 'string' ? err.error : (err.error?.mensagem || 'Falha ao processar requisição no servidor.');
  }

  verDetalhes(plano: Plano): void {
    this.planoDetalhes = plano;
    this.modalDetalhesAberto = true;
  }

  fecharDetalhes(): void {
    this.modalDetalhesAberto = false;
    this.planoDetalhes = null;
  }

  fecharModal(): void {
    this.modalAberto = false;
  }

  private criarPlanoVazio(): Plano {
    return {
      nome: '',
      descricao: '',
      beneficios: '',
      tag: 'NÍVEL DE ENTRADA',
      status: 'Ativo',
      preco: ''
    };
  }
}