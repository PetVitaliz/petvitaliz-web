import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-perfil-funcionario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil-funcionario.component.html',
  styleUrl: './perfil-funcionario.component.css'
})
export class PerfilFuncionarioComponent {
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
    nome: 'Dr. Rogério Souza',
    cargo: 'Veterinário Sênior',
    crmv: '12345-SP',
    email: 'rogerio.souza@petvital.com.br',
    telefone: '+55 (11) 98765-4321',
    nascimento: '15 de Março de 1962'
  };

  dadosTemp = { ...this.funcionario };

  alterarFoto(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files[0]) {
      const reader = new FileReader();

      reader.onload = () => {
        this.fotoPerfil = reader.result as string;
      };

      reader.readAsDataURL(input.files[0]);
    }
  }

  habilitarEdicao() {
    this.editando = true;
    this.dadosTemp = { ...this.funcionario };
  }

  salvarEdicao() {
    this.funcionario = { ...this.dadosTemp };
    this.editando = false;
  }

  cancelarEdicao() {
    this.dadosTemp = { ...this.funcionario };
    this.editando = false;
  }

  abrirModalSenha() {
    this.modalSenhaAberto = true;
    this.senhaAtual = '';
    this.novaSenha = '';
    this.confirmarSenha = '';
  }

  fecharModalSenha() {
    this.modalSenhaAberto = false;
  }

  salvarSenha() {
    if (!this.senhaAtual || !this.novaSenha || !this.confirmarSenha) {
      alert('Preencha todos os campos.');
      return;
    }

    if (this.novaSenha.length < 6) {
      alert('A nova senha precisa ter no mínimo 6 caracteres.');
      return;
    }

    if (this.novaSenha !== this.confirmarSenha) {
      alert('As senhas não coincidem.');
      return;
    }

    alert('Senha alterada com sucesso!');
    this.fecharModalSenha();
  }

  abrirModal2FA() {
    this.modal2FAAberto = true;
    this.codigo2FA = '';
  }

  fecharModal2FA() {
    this.modal2FAAberto = false;
  }

  ativar2FA() {
    if (!this.codigo2FA) {
      alert('Digite o código de verificação.');
      return;
    }

    if (this.codigo2FA.length < 6) {
      alert('O código precisa ter 6 dígitos.');
      return;
    }

    this.doisFatoresAtivo = true;
    alert('Autenticação em duas etapas ativada com sucesso!');
    this.fecharModal2FA();
  }

  desativar2FA() {
    this.doisFatoresAtivo = false;
    alert('Autenticação em duas etapas desativada.');
  }

  suporteChat() {
    alert('Abrir suporte via chat.');
  }

  centralAjuda() {
    alert('Abrir central de ajuda.');
  }
}