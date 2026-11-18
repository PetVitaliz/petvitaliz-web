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

  // Movimento da semana
  semanaOffset = 0;
  diaSelecionado: Date = this.inicioDoDia(new Date());
  readonly nomesDias = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

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
          this.planos = response.produtos.map((p: any) => {
            const partes = String(p.nome || '').split('|').map((x: string) => x.trim());
            const nivel = (partes[1] || '').toUpperCase();

            return {
              nome: partes[0] || 'Plano',
              nivel,
              cor: this.corDoNivel(nivel),
              preco: Number(p.preco) || 0,
              beneficios: p.beneficios
                ? String(p.beneficios).split(/[\n;]+/).map((b: string) => b.trim()).filter((b: string) => b.length > 0).length
                : 0
            };
          }).sort((a: any, b: any) => this.ordemDoNivel(a.nivel) - this.ordemDoNivel(b.nivel) || a.preco - b.preco);
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
          this.vetsAtivosCount = lista.filter((f: any) => (f.ativo === true || f.ativo === 'true') && (f.especialidade === 'veterinario' || f.especie === 'veterinario')).length;
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

            let dataObj = this.inicioDoDia(new Date());
            if (c.data_consulta) {
              const [ano, mes, dia] = String(c.data_consulta).split('T')[0].split('-').map(Number);
              dataObj = new Date(ano, mes - 1, dia);
            }

            return {
              dataObj,
              hora: c.hora_inicio,
              horario: `${c.hora_inicio} - ${horaFimFormatada}`,
              pet: c.pet?.nome || 'Paciente',
              raca: c.pet?.especie ? c.pet.especie.toUpperCase() : 'Pet',
              detalhe: `${c.observacoes || 'Consulta geral'} - Prof. ${c.funcionario?.nome || 'Clínica'}`,
              cor: statusCor,
              statusLabel: statusCor === 'laranja' ? 'Em espera' : statusCor === 'verde' ? 'Finalizada' : 'Agendada'
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
    return this.consultas.slice(0, 5);
  }

  get consultasEmEspera(): number {
    return this.consultas.filter(c => c.cor === 'laranja').length;
  }

  get consultasFinalizadas(): number {
    return this.consultas.filter(c => c.cor === 'verde').length;
  }

  get dataFormatada(): string {
    return new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  get planosResumo(): any[] {
    return this.planos.slice(0, 5);
  }

  corDoNivel(nivel: string): string {
    const cores: Record<string, string> = {
      BRONZE: '#B87333',
      PRATA: '#A3ADBC',
      OURO: '#E3A912',
      DIAMANTE: '#4FB3D9'
    };
    return cores[nivel] || '#5D6ED3';
  }

  ordemDoNivel(nivel: string): number {
    const ordem = ['BRONZE', 'PRATA', 'OURO', 'DIAMANTE'];
    const i = ordem.indexOf(nivel);
    return i === -1 ? 99 : i;
  }

  formatarPreco(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  // ---------- Movimento da semana ----------
  inicioDoDia(data: Date): Date {
    return new Date(data.getFullYear(), data.getMonth(), data.getDate());
  }

  mesmoDia(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  get inicioDaSemana(): Date {
    const hoje = this.inicioDoDia(new Date());
    const diaSemana = (hoje.getDay() + 6) % 7; // segunda = 0
    return new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - diaSemana + this.semanaOffset * 7);
  }

  get diasDaSemana(): any[] {
    const inicio = this.inicioDaSemana;
    const hoje = this.inicioDoDia(new Date());

    return Array.from({ length: 7 }, (_, i) => {
      const data = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + i);
      const doDia = this.consultas.filter(c => c.dataObj && this.mesmoDia(c.dataObj, data));

      return {
        data,
        rotulo: this.nomesDias[data.getDay()],
        numero: data.getDate(),
        total: doDia.length,
        agendadas: doDia.filter(c => c.cor === 'azul').length,
        espera: doDia.filter(c => c.cor === 'laranja').length,
        finalizadas: doDia.filter(c => c.cor === 'verde').length,
        hoje: this.mesmoDia(data, hoje),
        selecionado: this.mesmoDia(data, this.diaSelecionado)
      };
    });
  }

  get maxDaSemana(): number {
    return Math.max(...this.diasDaSemana.map(d => d.total), 1);
  }

  get totalDaSemana(): number {
    return this.diasDaSemana.reduce((soma, d) => soma + d.total, 0);
  }

  get tituloSemana(): string {
    const inicio = this.inicioDaSemana;
    const fim = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + 6);
    const fmt = (d: Date) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');
    return `${fmt(inicio)} – ${fmt(fim)}`;
  }

  get rotuloSemana(): string {
    if (this.semanaOffset === 0) return 'Esta semana';
    if (this.semanaOffset === -1) return 'Semana passada';
    if (this.semanaOffset === 1) return 'Próxima semana';
    return this.tituloSemana;
  }

  altura(valor: number): number {
    return (valor / this.maxDaSemana) * 100;
  }

  mudarSemana(delta: number): void {
    this.semanaOffset += delta;
    const inicio = this.inicioDaSemana;
    const hoje = this.inicioDoDia(new Date());
    this.diaSelecionado = this.semanaOffset === 0 ? hoje : inicio;
  }

  voltarParaHoje(): void {
    this.semanaOffset = 0;
    this.diaSelecionado = this.inicioDoDia(new Date());
  }

  selecionarDia(data: Date): void {
    this.diaSelecionado = data;
  }

  get consultasDoDiaSelecionado(): any[] {
    return this.consultas
      .filter(c => c.dataObj && this.mesmoDia(c.dataObj, this.diaSelecionado))
      .sort((a, b) => String(a.hora).localeCompare(String(b.hora)));
  }

  get diaSelecionadoLabel(): string {
    const texto = this.diaSelecionado.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
    return texto.charAt(0).toUpperCase() + texto.slice(1);
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