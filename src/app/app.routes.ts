import { Routes } from '@angular/router';

import { authAdminGuard } from './guards/auth-admin.guard';
import { authFuncionarioGuard } from './guards/auth-funcionario.guard';
import { authUsuarioGuard } from './guards/auth-usuario.guard';

// PÚBLICO
import { HomeUsuarioComponent } from './pages/publico/home-publico/home-usuario.component';
import { LoginComponent } from './pages/publico/login/login.component';
import { EsqueciSenhaComponent } from './pages/publico/esqueci-senha/esqueci-senha.component';
import { CadastroComponent } from './pages/publico/cadastro/cadastro.component';
import { ResetSenhaComponent } from './pages/publico/reset-senha/reset-senha.component';
import { ServicosComponent } from './pages/publico/servicos/servicos.component';
import { SobreNosComponent } from './pages/publico/sobre-nos/sobre-nos.component';
import { ContatoComponent } from './pages/publico/contato/contato.component';
import { AdocaoComponent } from './pages/publico/adocao/adocao.component';
import { EmergenciaComponent } from './pages/publico/emergencia/emergencia.component';

// USUÁRIO
import { AgendamentoComponent } from './pages/usuario/agendamento/agendamento.component';
import { CadastroPetComponent } from './pages/usuario/cadastro-pet/cadastro-pet.component';
import { ListarCadastroPetComponent } from './pages/usuario/listar-cadastro-pet/listar-cadastro-pet.component';
import { PlanosPetComponent } from './pages/usuario/planos-pet/planos-pet.component';
import { PagamentoPlanoComponent } from './pages/usuario/pagamento-plano/pagamento-plano.component';
import { ContratoPlanoComponent } from './pages/usuario/contrato-plano/contrato-plano.component';
import { PlanoSucessoComponent } from './pages/usuario/plano-sucesso/plano-sucesso.component';
import { ContatoUsuarioComponent } from './pages/usuario/contato-usuario/contato-usuario.component';

// FUNCIONÁRIO
import { HomeFuncionarioComponent } from './pages/funcionario/home-funcionario/home-funcionario.component';
import { ConsultasFuncionarioComponent } from './pages/funcionario/consultas-funcionario/consultas-funcionario.component';
import { ClientesFuncionarioComponent } from './pages/funcionario/clientes-funcionario/clientes-funcionario.component';
import { PetsFuncionarioComponent } from './pages/funcionario/pets-funcionario/pets-funcionario.component';
import { PerfilFuncionarioComponent } from './pages/funcionario/perfil-funcionario/perfil-funcionario.component';

// ADM
import { HomeAdmComponent } from './pages/adm/home-adm/home-adm.component';
import { PlanosAdmComponent } from './pages/adm/planos-adm/planos-adm.component';
import { EquipeFuncionariosComponent } from './pages/adm/equipe-funcionarios/equipe-funcionarios.component';
import { ConsultasAgendadasComponent } from './pages/adm/consultas-agendadas/consultas-agendadas.component';
import { ConsultasAdmComponent } from './pages/adm/consultas-adm/consultas-adm.component';
import { ClientesAdmComponent } from './pages/adm/clientes-adm/clientes-adm.component';
import { FinanceiroAdmComponent } from './pages/adm/financeiro-adm/financeiro-adm.component';
import { ListarAdminComponent } from './pages/adm/listar-admin/listar-admin.component';

export const routes: Routes = [
  // PÚBLICO
  { path: '', component: HomeUsuarioComponent },
  { path: 'home', component: HomeUsuarioComponent },
  { path: 'login', component: LoginComponent },
  { path: 'esqueci-senha', component: EsqueciSenhaComponent },
  { path: 'cadastro', component: CadastroComponent },
  { path: 'reset-senha', component: ResetSenhaComponent },
  { path: 'servicos', component: ServicosComponent },
  { path: 'sobre-nos', component: SobreNosComponent },
  { path: 'contato', component: ContatoComponent },
  { path: 'adocao', component: AdocaoComponent },
  { path: 'emergencia', component: EmergenciaComponent },

  // USUÁRIO
  {
    path: 'user/home',
    component: HomeUsuarioComponent,
    canActivate: [authUsuarioGuard]
  },
  {
    path: 'user/cadastar/pet',
    component: CadastroPetComponent,
    canActivate: [authUsuarioGuard]
  },
  {
    path: 'user/listar-cadastro-pet',
    component: ListarCadastroPetComponent,
    canActivate: [authUsuarioGuard]
  },
  {
    path: 'user/planos-pet',
    component: PlanosPetComponent,
    canActivate: [authUsuarioGuard]
  },
  {
    path: 'user/agendamento',
    component: AgendamentoComponent,
    canActivate: [authUsuarioGuard]
  },
  {
    path: 'user/pagamento-plano',
    component: PagamentoPlanoComponent,
    canActivate: [authUsuarioGuard]
  },
  {
    path: 'user/contrato-plano',
    component: ContratoPlanoComponent,
    canActivate: [authUsuarioGuard]
  },
  {
    path: 'user/plano-sucesso',
    component: PlanoSucessoComponent,
    canActivate: [authUsuarioGuard]
  },
  {
    path: 'user/contato',
    component: ContatoUsuarioComponent,
    canActivate: [authUsuarioGuard]
  },

  // FUNCIONÁRIO
  {
    path: 'funcionario/home',
    component: HomeFuncionarioComponent,
    canActivate: [authFuncionarioGuard]
  },
  {
    path: 'funcionario/consultas',
    component: ConsultasFuncionarioComponent,
    canActivate: [authFuncionarioGuard]
  },
  {
    path: 'funcionario/clientes',
    component: ClientesFuncionarioComponent,
    canActivate: [authFuncionarioGuard]
  },
  {
    path: 'funcionario/pets',
    component: PetsFuncionarioComponent,
    canActivate: [authFuncionarioGuard]
  },
  {
    path: 'funcionario/perfil',
    component: PerfilFuncionarioComponent,
    canActivate: [authFuncionarioGuard]
  },

  // ADM
  {
    path: 'adm/home',
    component: HomeAdmComponent,
    canActivate: [authAdminGuard]
  },
  {
    path: 'adm/consultas',
    component: ConsultasAdmComponent,
    canActivate: [authAdminGuard]
  },
  {
    path: 'adm/clientes',
    component: ClientesAdmComponent,
    canActivate: [authAdminGuard]
  },
  {
    path: 'adm/planos',
    component: PlanosAdmComponent,
    canActivate: [authAdminGuard]
  },
  {
    path: 'adm/equipe-funcionarios',
    component: EquipeFuncionariosComponent,
    canActivate: [authAdminGuard]
  },
  {
    path: 'adm/consultas-agendadas',
    component: ConsultasAgendadasComponent,
    canActivate: [authAdminGuard]
  },
  {
    path: 'adm/financeiro',
    component: FinanceiroAdmComponent,
    canActivate: [authAdminGuard]
  },
  {
    path: 'adm/listar-admin',
    component: ListarAdminComponent,
    canActivate: [authAdminGuard]
  },
  {
    path: 'adm/editar-admin/:id',
    component: ListarAdminComponent,
    canActivate: [authAdminGuard]
  },

  { path: '**', redirectTo: '' }
];