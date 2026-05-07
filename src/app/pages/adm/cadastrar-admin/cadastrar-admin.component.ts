import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminsService } from '../../../core/services/admins.service';

@Component({
  selector: 'app-cadastrar-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cadastrar-admin.component.html',
  styleUrl: './cadastrar-admin.component.css'
})
export class CadastrarAdminComponent {

  mostrarSenha = false;

  admin = {
    nome: '',
    email: '',
    cpf: '',
    cargo: '',
    nivelAcesso: '',
    senha: ''
  };

  constructor(
    private router: Router,
    private adminsService: AdminsService
  ) {}

  alternarSenha() {
    this.mostrarSenha = !this.mostrarSenha;
  }

  cadastrarAdmin() {
    if (
      !this.admin.nome ||
      !this.admin.email ||
      !this.admin.cpf ||
      !this.admin.cargo ||
      !this.admin.nivelAcesso ||
      !this.admin.senha
    ) {
      alert('Preencha todos os campos.');
      return;
    }

    const novoAdmin = {
      id: 'BPV-' + Math.floor(Math.random() * 9000 + 1000),
      nome: this.admin.nome,
      email: this.admin.email,
      cargo: this.admin.cargo,
      acesso: this.admin.nivelAcesso,
      status: 'Ativo',
      imagem: 'assets/img/perfil.png'
    };

    this.adminsService.adicionarAdmin(novoAdmin);

    alert('Administrador cadastrado com sucesso!');
    this.router.navigate(['/adm/listar-admin']);
  }

  cancelar() {
    this.router.navigate(['/adm/listar-admin']);
  }
}