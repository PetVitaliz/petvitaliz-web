import { Routes } from '@angular/router';
import { HomeUsuarioComponent } from './pages/usuario/home-usuario/home-usuario.component';
import { LoginComponent } from './pages/usuario/login/login.component';
import { EsqueciSenhaComponent } from './pages/usuario/esqueci-senha/esqueci-senha.component';
import { CadastroComponent } from './pages/usuario/cadastro/cadastro.component';
import { ResetSenhaComponent } from './pages/usuario/reset-senha/reset-senha.component';
import { LoginFuncionarioComponent } from './pages/funcionario/login-funcionario/login-funcionario.component';
import { EsqueciSenhaFuncionarioComponent } from './pages/funcionario/esqueci-senha-funcionario/esqueci-senha-funcionario.component';

export const routes: Routes = [
  { path: '', component: HomeUsuarioComponent },
  { path: 'usuario/login', component: LoginComponent },
  { path: 'usuario/esqueci-senha', component: EsqueciSenhaComponent },
  { path: 'usuario/cadastro', component: CadastroComponent },
  { path: 'usuario/reset-senha', component: ResetSenhaComponent },
  { path: 'funcionario/login', component: LoginFuncionarioComponent },
  { path: 'funcionario/esqueci-senha', component: EsqueciSenhaFuncionarioComponent }
];