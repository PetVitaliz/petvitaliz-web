import { Routes } from '@angular/router';

// USUÁRIO
import { HomeUsuarioComponent } from './pages/usuario/home-usuario/home-usuario.component';
import { LoginComponent } from './pages/usuario/login/login.component';
import { EsqueciSenhaComponent } from './pages/usuario/esqueci-senha/esqueci-senha.component';
import { CadastroComponent } from './pages/usuario/cadastro/cadastro.component';
import { ResetSenhaComponent } from './pages/usuario/reset-senha/reset-senha.component';
import { ServicosComponent } from './pages/usuario/servicos/servicos.component';

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
import { SobreNosComponent } from './pages/usuario/sobre-nos/sobre-nos.component';
import { ContatoComponent } from './pages/usuario/contato/contato.component';
import { AdocaoComponent } from './pages/usuario/adocao/adocao.component';
import { EmergenciaComponent } from './pages/usuario/emergencia/emergencia.component';

export const routes: Routes = [

  { path: '', component: HomeUsuarioComponent },

  { path: 'usuario/login', component: LoginComponent },
  { path: 'usuario/esqueci-senha', component: EsqueciSenhaComponent },
  { path: 'usuario/cadastro', component: CadastroComponent },
  { path: 'usuario/reset-senha', component: ResetSenhaComponent },
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

  { path: '**', redirectTo: '' }

];