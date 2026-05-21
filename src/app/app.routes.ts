import { Routes } from '@angular/router';

import { authAdminGuard } from './guards/auth-admin.guard';
import { authFuncionarioGuard } from './guards/auth-funcionario.guard';

// USUÁRIO
import { HomeUsuarioComponent } from './pages/usuario/home-usuario/home-usuario.component';
import { LoginComponent } from './pages/usuario/login/login.component';
import { EsqueciSenhaComponent } from './pages/usuario/esqueci-senha/esqueci-senha.component';
import { CadastroComponent } from './pages/usuario/cadastro/cadastro.component';
import { ResetSenhaComponent } from './pages/usuario/reset-senha/reset-senha.component';
import { ServicosComponent } from './pages/usuario/servicos/servicos.component';
import { SobreNosComponent } from './pages/usuario/sobre-nos/sobre-nos.component';
import { ContatoComponent } from './pages/usuario/contato/contato.component';
import { AdocaoComponent } from './pages/usuario/adocao/adocao.component';
import { EmergenciaComponent } from './pages/usuario/emergencia/emergencia.component';
import { AgendamentoComponent } from './pages/usuario/agendamento/agendamento.component';
import { CadastroPetComponent } from './pages/usuario/cadastro-pet/cadastro-pet.component';
import { ListarCadastroPetComponent } from './pages/usuario/listar-cadastro-pet/listar-cadastro-pet.component';
import { PlanosPetComponent } from './pages/usuario/planos-pet/planos-pet.component';
import { PagamentoPlanoComponent } from './pages/usuario/pagamento-plano/pagamento-plano.component';
import { ContratoPlanoComponent } from './pages/usuario/contrato-plano/contrato-plano.component';
import { PlanoSucessoComponent } from './pages/usuario/plano-sucesso/plano-sucesso.component';

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
  { path: '', component: HomeUsuarioComponent },
  { path: 'home', component: HomeUsuarioComponent },

  { path: 'usuario/login', component: LoginComponent },
  { path: 'usuario/esqueci-senha', component: EsqueciSenhaComponent },
  { path: 'usuario/cadastro', component: CadastroComponent },
  { path: 'usuario/reset-senha', component: ResetSenhaComponent },

  { path: 'servicos', component: ServicosComponent },
  { path: 'sobre-nos', component: SobreNosComponent },
  { path: 'contato', component: ContatoComponent },
  { path: 'adocao', component: AdocaoComponent },
  { path: 'emergencia', component: EmergenciaComponent },

  { path: 'cadastro-pet', component: CadastroPetComponent },
  { path: 'listar-cadastro-pet', component: ListarCadastroPetComponent },
  { path: 'planos-pet', component: PlanosPetComponent },
  { path: 'agendamento', component: AgendamentoComponent },
  { path: 'pagamento-plano', component: PagamentoPlanoComponent },
  { path: 'contrato-plano', component: ContratoPlanoComponent },
  { path: 'plano-sucesso', component: PlanoSucessoComponent },

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