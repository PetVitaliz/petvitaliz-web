import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AdminsService {

  administradores: any[] = [
    {
      id: 'BPV-8821',
      nome: 'Dra. Beatriz Santos',
      email: 'beatriz.santos@petvital.com',
      cargo: 'Diretora Clínica',
      acesso: 'TOTAL',
      status: 'Ativo',
      imagem: 'assets/img/perfil.png'
    },
    {
      id: 'BPV-8822',
      nome: 'Ricardo Oliveira',
      email: 'ricardo.oliveira@petvital.com',
      cargo: 'Gerente Financeiro',
      acesso: 'INTERMEDIÁRIO',
      status: 'Ativo',
      imagem: 'assets/img/perfil.png'
    }
  ];

  listarAdmins() {
    return this.administradores;
  }

  adicionarAdmin(admin: any) {
    this.administradores.unshift(admin);
  }

  excluirAdmin(id: string) {
    this.administradores =
      this.administradores.filter(admin => admin.id !== id);
  }
}