import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { DataMaskDirective } from './data-mask.directive';

@Component({
  selector: 'app-perfil-funcionario',
  standalone: true,
  imports: [CommonModule, FormsModule, DataMaskDirective],
  templateUrl: './perfil-funcionario.component.html',
  styleUrl: './perfil-funcionario.component.css'
})
export class PerfilFuncionarioComponent implements OnInit {

  fotoPerfil = 'assets/img/veterinario.png';

  editando = false;
  modalSenhaAberto = false;
  modal2FAAberto = false;
  doisFatoresAtivo = false;

  senhaAtual = '';
  novaSenha = '';
  confirmarSenha = '';
  codigo2FA = '';

  funcionario = {
    nome: 'Carregando...',
    sobrenome: '',
    cargo: 'Funcionário',
    crmv: 'Não informado',
    email: '',
    telefone: '',
    nascimento: '00/00/0000'
  };

  dadosTemp = { ...this.funcionario };

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.buscarDadosPerfil();
  }

  buscarDadosPerfil(): void {
    this.http.get<any>(`${environment.apiUrl}/funcionario/perfil-dados`, { withCredentials: true }).subscribe({
      next: (dados) => {
        this.funcionario = {
          nome: dados.nome,
          sobrenome: dados.sobrenome || '',
          cargo: dados.especialidade === 'veterinario' ? 'Veterinário(a) Clínico' : 'Profissional de Estética',
          crmv: dados.crmv || 'Inscrição ativa', 
          email: dados.email,
          telefone: dados.telefone || '',
          nascimento: localStorage.getItem('nascimento_fun') || '00/00/0000'
        };

        if (dados.foto_url) {
          this.fotoPerfil = dados.foto_url;
        }

        this.dadosTemp = { ...this.funcionario };
      },
      error: (err) => console.error('Erro ao carregar perfil do funcionário:', err)
    });
  }

  alterarFoto(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        this.fotoPerfil = reader.result as string;
        localStorage.setItem('fotoFuncionario', this.fotoPerfil);
        window.dispatchEvent(new Event('fotoFuncionarioAtualizada'));
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  habilitarEdicao(): void {
    this.editando = true;
    this.dadosTemp = { ...this.funcionario };
  }

  salvarEdicao(): void {
    if (!this.dadosTemp.nome) {
      alert('O nome é obrigatório.');
      return;
    }

    if (this.dadosTemp.nascimento) {
      localStorage.setItem('nascimento_fun', this.dadosTemp.nascimento);
    }

    const payload = {
      nome: this.dadosTemp.nome.trim(),
      sobrenome: this.dadosTemp.sobrenome.trim(),
      email: this.funcionario.email.trim(), 
      telefone: this.dadosTemp.telefone ? this.dadosTemp.telefone.trim() : null
    };

    this.http.put<any>(`${environment.apiUrl}/funcionario/perfil-dados/atualizar`, payload, { withCredentials: true }).subscribe({
      next: (res) => {
        alert(res.mensagem || 'Perfil updated com sucesso!');
        this.buscarDadosPerfil();
        this.editando = false;
      },
      error: (err) => {
        console.error('Erro ao atualizar perfil no servidor:', err);
        alert(err.error?.mensagem || 'Não foi possível salvar as alterações.');
      }
    });
  }

  cancelarEdicao(): void {
    this.dadosTemp = { ...this.funcionario };
    this.editando = false;
  }

  abrirModalSenha(): void {
    this.modalSenhaAberto = true;
    this.senhaAtual = ''; this.novaSenha = ''; this.confirmarSenha = '';
  }

  fecharModalSenha(): void { this.modalSenhaAberto = false; }

  salvarSenha(): void {
    if (!this.senhaAtual || !this.novaSenha || !this.confirmarSenha) {
      alert('Preencha todos os campos.'); return;
    }
    if (this.novaSenha !== this.confirmarSenha) {
      alert('As senhas não coincidem.'); return;
    }
    alert('Senha alterada com sucesso no sistema!');
    this.fecharModalSenha();
  }

  abrirModal2FA(): void { this.modal2FAAberto = true; this.codigo2FA = ''; }
  fecharModal2FA(): void { this.modal2FAAberto = false; }

  ativar2FA(): void {
    if (this.codigo2FA.length < 6) { alert('O código precisa ter 6 dígitos.'); return; }
    this.doisFatoresAtivo = true;
    this.fecharModal2FA();
  }

  desativar2FA(): void { this.doisFatoresAtivo = false; }
  suporteChat(): void { alert('Iniciando chat de suporte interno da clínica...'); }
  centralAjuda(): void { alert('Redirecionando para a base de conhecimento PetVitaliz...'); }
}