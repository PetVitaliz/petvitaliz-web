import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ConsultasService, ConsultaFuncionario } from '../../../core/services/consultas.service';

@Component({
  selector: 'app-clientes-funcionario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clientes-funcionario.component.html',
  styleUrl: './clientes-funcionario.component.css'
})
export class ClientesFuncionarioComponent implements OnInit {

  clientes: any[] = []; 
  clienteSelecionado: any = null;
  historicoConsultas: any[] = [];

  searchTerm = '';
  statusFiltro = 'Todos';

  modalDetalhesAberto = false;
  modalPetsAberto = false;
  modalAgendarAberto = false;

  novaConsulta = {
    horario: '',
    data: '',
    pet: '',
    idade: 'Calculada em consulta',
    motivo: 'Consulta de rotina'
  };

  constructor(private http: HttpClient, private consultasService: ConsultasService) {}

  ngOnInit(): void {
    this.buscarClientesDaAPI();
  }

  buscarClientesDaAPI(): void {
    this.http.get<any>(`${environment.apiUrl}/funcionario/clientes`, { withCredentials: true })
      .subscribe({
        next: (res) => {
          const rawClientes = res.clientes || res.Clientes || res || [];
          
          this.clientes = rawClientes.map((c: any) => ({
            ...c,
            id_usuario: c.id_usuario || c.id,
            status: c.status || 'ATIVO',
            ultimaVisita: 'Consultar histórico',
            petsLista: Array.isArray(c.petsLista) ? c.petsLista : [],
            petsDetalhesLista: Array.isArray(c.petsDetalhesLista) ? c.petsDetalhesLista : []
          }));
        },
        error: (err) => {
          console.error('Erro ao buscar tutores do banco:', err);
        }
      });
  }

  get clientesFiltrados() {
    const termo = this.searchTerm.toLowerCase().trim();

    return this.clientes.filter(cliente => {
      const matchTexto =
        !termo ||
        cliente.nome.toLowerCase().includes(termo) ||
        cliente.cpf.toLowerCase().includes(termo) ||
        cliente.telefone.toLowerCase().includes(termo) ||
        cliente.email.toLowerCase().includes(termo);

      const matchStatus =
        this.statusFiltro === 'Todos' ||
        cliente.status === this.statusFiltro;

      return matchTexto && matchStatus;
    });
  }

  get totalAtivos(): number {
    return this.clientes.filter(c => c.status === 'ATIVO').length;
  }

  get totalInativos(): number {
    return this.clientes.filter(c => c.status === 'INATIVO').length;
  }

  get totalPets(): number {
    return this.clientes.reduce((total, cliente) => total + Number(cliente.pets || 0), 0);
  }

  inicialCliente(cliente: any): string {
    if (!cliente || !cliente.nome) return 'C';
    return cliente.nome.charAt(0).toUpperCase();
  }

  limparBusca(): void {
    this.searchTerm = '';
    this.statusFiltro = 'Todos';
  }

  abrirDetalhes(cliente: any): void {
    this.clienteSelecionado = cliente;
    this.historicoConsultas = [];

    this.http.get<any>(`${environment.apiUrl}/funcionario/consultas`, { withCredentials: true })
      .subscribe({
        next: (res) => {
          const todas = res.consultas || res.Consultas || res || [];
          
          this.historicoConsultas = todas.filter((c: any) => {
            if (!c) return false;
            
            const nomeDoPetDaConsulta = c.pet && typeof c.pet === 'object' ? c.pet.nome : c.pet;
            
            const nomeAlternativo = c.nome_pet || c.pet_nome || '';

            return (
              cliente.petsLista.includes(nomeDoPetDaConsulta) || 
              cliente.petsLista.includes(nomeAlternativo)
            );
          });
          
          this.modalDetalhesAberto = true;
        },
        error: (err) => {
          console.error('Erro ao carregar histórico médico:', err);
          this.modalDetalhesAberto = true;
        }
      });
  }

  fecharDetalhes(): void {
    this.modalDetalhesAberto = false;
    this.clienteSelecionado = null;
    this.historicoConsultas = [];
  }

  verPets(cliente: any): void {
    this.clienteSelecionado = cliente;
    this.modalPetsAberto = true;
  }

  fecharPets(): void {
    this.modalPetsAberto = false;
    this.clienteSelecionado = null;
  }

  agendarConsulta(cliente: any): void {
    this.clienteSelecionado = cliente;
    this.modalAgendarAberto = true;

    this.novaConsulta = {
      horario: '',
      data: this.pegarDataHoje(),
      pet: cliente.petsLista?.[0] || '',
      idade: 'Calculada em consulta',
      motivo: 'Consulta de rotina'
    };
  }

  fecharAgendar(): void {
    this.modalAgendarAberto = false;
    this.clienteSelecionado = null;
  }

  salvarAgendamento(): void {
    if (
      !this.clienteSelecionado ||
      !this.novaConsulta.horario ||
      !this.novaConsulta.data ||
      !this.novaConsulta.pet ||
      !this.novaConsulta.motivo
    ) {
      alert('Preencha todos os campos obrigatórios do agendamento.');
      return;
    }

    const consulta: ConsultaFuncionario = {
      hora: this.novaConsulta.horario,
      horario: this.novaConsulta.horario,
      periodo: this.definirPeriodo(this.novaConsulta.horario),
      pet: this.novaConsulta.pet,
      idade: this.novaConsulta.idade,
      tutor: this.clienteSelecionado.nome,
      motivo: this.novaConsulta.motivo,
      status: 'AGENDADO',
      data: this.novaConsulta.data,
      imagem: '',
      tipo: 'gray'
    };

    this.consultasService.adicionarConsulta(consulta);
    this.fecharAgendar();
    alert('Consulta agendada com sucesso!');
  }

  formatarDataParaExibicao(data: string): string {
    if (!data) return 'Data indefinida';
    const partes = data.split('T')[0].split('-');
    if (partes.length !== 3) return data;

    const meses: any = {
      '01': 'Jan', '02': 'Fev', '03': 'Mar', '04': 'Abr', '05': 'Mai', '06': 'Jun',
      '07': 'Jul', '08': 'Ago', '09': 'Set', '10': 'Out', '11': 'Nov', '12': 'Dez'
    };

    return `${partes[2]} ${meses[partes[1]]} ${partes[0]}`;
  }

  private definirPeriodo(horario: string): string {
    const hora = Number(horario.split(':')[0]);
    return hora >= 12 ? 'PM' : 'AM';
  }

  private pegarDataHoje(): string {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }
}