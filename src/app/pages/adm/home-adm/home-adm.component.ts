import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-home-adm',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home-adm.component.html',
  styleUrl: './home-adm.component.css'
})
export class HomeAdmComponent implements OnInit {
  modalLogsAberto = false;
  planos: any[] = [];
  administradores: any[] = [];
  consultas: any[] = [];
  
  admsAtivosCount = 0;
  funcionariosAtivosCount = 0;
  vetsAtivosCount = 0;
  apoioAtivosCount = 0;

  carregandoPlanos = true;
  carregandoAdms = true;
  carregandoConsultas = true;

  dataLabel = '';

  logs = [
    { tipo: 'Administrador', nome: 'Ana Souza', acao: 'Acessou o painel administrativo', horario: 'Hoje, 09:42' },
    { tipo: 'Administrador', nome: 'Marcos Lima', acao: 'Atualizou permissões de acesso', horario: 'Hoje, 08:55' },
    { tipo: 'Funcionário', nome: 'Dr. Rogério Souza', acao: 'Finalizou uma consulta', horario: 'Ontem, 18:20' },
    { tipo: 'Funcionário', nome: 'Dra. Carla Mendes', acao: 'Confirmou uma vacinação', horario: 'Ontem, 16:10' }
  ];

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    this.definirDataLabel();
    this.buscarPlanosReal();
    this.buscarAdministradoresReal();
    this.buscarMetricasFuncionariosReal();
    this.buscarConsultasDoDiaReal();
  }

  definirDataLabel(): void {
    const hoje = new Date();
    this.dataLabel = hoje.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }).toUpperCase();
  }

  buscarPlanosReal(): void {
    this.carregandoPlanos = true;
    this.http.get(`${environment.apiUrl}/adm/listar/produtos`, { withCredentials: true }).subscribe({
      next: (response: any) => {
        if (response && response.produtos) {
          this.planos = response.produtos.map((p: any, index: number) => {
            const partesNome = p.nome.split(' | ');
            const nomeReal = partesNome[0];
            const tagReal = partesNome[1] || 'PREMIUM';

            return {
              tipo: tagReal,
              nome: nomeReal,
              preco: `R$ ${p.preco}`,
              rota: '/adm/planos',
              destaque: tagReal === 'RECOMENDADO' || index === 2,
              beneficios: p.beneficios 
                ? p.beneficios.split(/[\n,;]+/).map((b: string) => b.trim()).filter((b: string) => b.length > 0)
                : []
            };
          });
        }
        this.carregandoPlanos = false;
      },
      error: (err) => {
        console.error('Erro ao buscar planos na Home:', err);
        this.carregandoPlanos = false;
      }
    });
  }

  buscarAdministradoresReal(): void {
    this.carregandoAdms = true;
    this.http.get(`${environment.apiUrl}/adm/listar/adm`, { withCredentials: true }).subscribe({
      next: (response: any) => {
        if (response && response.ADMs) {
          this.admsAtivosCount = response.ADMs.filter((a: any) => a.ADM_ATIVO === true || a.ADM_ATIVO === 'true').length;

          this.administradores = response.ADMs.slice(0, 3).map((adm: any) => {
            return {
              id: adm.ADM_ID,
              nome: adm.ADM_NOME,
              email: adm.ADM_EMAIL,
              ativo: adm.ADM_ATIVO ? 'Ativo' : 'Inativo',
              inicial: adm.ADM_NOME ? adm.ADM_NOME.substring(0, 2).toUpperCase() : 'AD',
              foto: adm.ADM_FOTO_URL ? adm.ADM_FOTO_URL : null,
              ultimo: 'Hoje, 14:32',
            };
          });
        }
        this.carregandoAdms = false;
      },
      error: (err) => {
        console.error('Erro ao buscar administradores na Home:', err);
        this.carregandoAdms = false;
      }
    });
  }

  buscarMetricasFuncionariosReal(): void {
    this.http.get(`${environment.apiUrl}/adm/listar/funcionario`, { withCredentials: true }).subscribe({
      next: (response: any) => {
        if (response && response.funcionarios) {
          const lista = response.funcionarios;
          this.funcionariosAtivosCount = lista.filter((f: any) => f.ativo === true || f.ativo === 'true').length;
          this.vetsAtivosCount = lista.filter((f: any) => (f.ativo === true || f.ativo === 'true') && f.especie === 'veterinario').length;
          this.apoioAtivosCount = lista.filter((f: any) => 
            (f.ativo === true || f.ativo === 'true') && ['tosador', 'recepcionista', 'financeiro'].includes(f.especialidade)
          ).length;
        }
      },
      error: (err) => console.error('Erro ao computar métricas de funcionários na Home:', err)
    });
  }

  buscarConsultasDoDiaReal(): void {
    this.carregandoConsultas = true;
    this.http.get<any>(`${environment.apiUrl}/adm/consultas`, { withCredentials: true }).subscribe({
      next: (res) => {
        if (res && res.consultas) {
          this.consultas = res.consultas.map((c: any) => {
            const [h, m] = c.hora_inicio.split(':').map(Number);
            const horaFimFormatada = `${String(h + 1).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
            
            let statusCor = 'azul';
            if (c.status === 'em_espera') statusCor = 'laranja';
            if (c.status === 'finalizado') statusCor = 'verde';

            return {
              horario: `${c.hora_inicio} - ${horaFimFormatada}`,
              pet: c.pet?.nome || 'Paciente',
              raca: c.pet?.especie ? c.pet.especie.toUpperCase() : 'Pet',
              detalhe: `${c.observacoes || 'Consulta geral'} - Prof. ${c.funcionario?.nome || 'Clínica'}`,
              cor: statusCor
            };
          });
        }
        this.carregandoConsultas = false;
      },
      error: (err) => {
        console.error('Erro ao buscar consultas na Home ADM:', err);
        this.carregandoConsultas = false;
      }
    });
  }

  get consultasHomePaginadas(): any[] {
    return this.consultas.slice(0, 2);
  }

  get totalEquipeAtiva(): number {
    return this.admsAtivosCount + this.funcionariosAtivosCount;
  }

  abrirListarAdmin(): void {
    this.router.navigate(['/adm/listar/adm/cadastrar']);
  }

  abrirModalLogs(event?: Event): void {
    event?.stopPropagation();
    this.modalLogsAberto = true;
  }

  fecharModalLogs(): void {
    this.modalLogsAberto = false;
  }
}