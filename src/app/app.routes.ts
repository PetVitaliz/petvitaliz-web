import { Routes } from '@angular/router';

<<<<<<< HEAD
import { authAdminGuard } from './guards/auth-admin.guard';
import { authFuncionarioGuard } from './guards/auth-funcionario.guard';

=======
>>>>>>> 44eeca2f2ddc344f8c8e427a26b436475878460d
// USUÁRIO
import { HomeUsuarioComponent } from './pages/usuario/home-usuario/home-usuario.component';
import { LoginComponent } from './pages/usuario/login/login.component';
import { EsqueciSenhaComponent } from './pages/usuario/esqueci-senha/esqueci-senha.component';
import { CadastroComponent } from './pages/usuario/cadastro/cadastro.component';
import { ResetSenhaComponent } from './pages/usuario/reset-senha/reset-senha.component';
import { ServicosComponent } from './pages/usuario/servicos/servicos.component';
<<<<<<< HEAD
import { SobreNosComponent } from './pages/usuario/sobre-nos/sobre-nos.component';
import { ContatoComponent } from './pages/usuario/contato/contato.component';
import { AdocaoComponent } from './pages/usuario/adocao/adocao.component';
import { EmergenciaComponent } from './pages/usuario/emergencia/emergencia.component';
=======
>>>>>>> 44eeca2f2ddc344f8c8e427a26b436475878460d

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
<<<<<<< HEAD
=======
import { SobreNosComponent } from './pages/usuario/sobre-nos/sobre-nos.component';
import { ContatoComponent } from './pages/usuario/contato/contato.component';
import { AdocaoComponent } from './pages/usuario/adocao/adocao.component';
import { EmergenciaComponent } from './pages/usuario/emergencia/emergencia.component';
>>>>>>> 44eeca2f2ddc344f8c8e427a26b436475878460d

export const routes: Routes = [

  { path: '', component: HomeUsuarioComponent },
<<<<<<< HEAD
  { path: 'home', component: HomeUsuarioComponent },
=======
>>>>>>> 44eeca2f2ddc344f8c8e427a26b436475878460d

  { path: 'usuario/login', component: LoginComponent },
  { path: 'usuario/esqueci-senha', component: EsqueciSenhaComponent },
  { path: 'usuario/cadastro', component: CadastroComponent },
  { path: 'usuario/reset-senha', component: ResetSenhaComponent },
<<<<<<< HEAD

  { path: 'servicos', component: ServicosComponent },
  { path: 'sobre-nos', component: SobreNosComponent },
  { path: 'contato', component: ContatoComponent },
  { path: 'adocao', component: AdocaoComponent },
  { path: 'emergencia', component: EmergenciaComponent },

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
=======
  { path: 'servicos', component: ServicosComponent},
  { path: 'sobre-nos', component: SobreNosComponent},
  { path: 'contato', component: ContatoComponent},
  { path: 'adocao', component: AdocaoComponent},
  { path: 'emergencia', component: EmergenciaComponent},

  { path: 'funcionario/home', component: HomeFuncionarioComponent },
  { path: 'funcionario/consultas', component: ConsultasFuncionarioComponent },
  { path: 'funcionario/clientes', component: ClientesFuncionarioComponent },
  { path: 'funcionario/pets', component: PetsFuncionarioComponent },
  { path: 'funcionario/perfil', component: PerfilFuncionarioComponent },

  { path: 'adm/home', component: HomeAdmComponent },
  { path: 'adm/consultas', component: ConsultasAdmComponent },
  { path: 'adm/clientes', component: ClientesAdmComponent },
  { path: 'adm/planos', component: PlanosAdmComponent },
  { path: 'adm/equipe-funcionarios', component: EquipeFuncionariosComponent },
  { path: 'adm/consultas-agendadas', component: ConsultasAgendadasComponent },
  { path: 'adm/financeiro', component: FinanceiroAdmComponent },
  { path: 'adm/listar-admin', component: ListarAdminComponent },
  { path: 'adm/editar-admin/:id', component: ListarAdminComponent },
>>>>>>> 44eeca2f2ddc344f8c8e427a26b436475878460d

  { path: '**', redirectTo: '' }

];