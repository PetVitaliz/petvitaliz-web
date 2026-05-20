import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-financeiro-adm',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './financeiro-adm.component.html',
  styleUrl: './financeiro-adm.component.css'
})
export class FinanceiroAdmComponent {

  busca = '';
  modalAberto = false;
  menuAberto: number | null = null;
  periodoFluxo = 'Mensal';

  novaTransacao = {
    data: '',
    descricao: '',
    cliente: '',
    categoria: 'Serviço',
    valor: 0,
    tipo: 'Receita',
    status: 'Pago'
  };

  transacoes = [
    { data: '15 Out, 2024', descricao: 'Cirurgia Ortopédica - Max', cliente: 'Cliente: Roberto Silva', categoria: 'Procedimento', valor: 2400, tipo: 'Receita', status: 'Pago' },
    { data: '14 Out, 2024', descricao: 'Reposição de Vacinas V10', cliente: 'Fornecedor: PetHealth SA', categoria: 'Estoque', valor: -850, tipo: 'Despesa', status: 'Pendente' },
    { data: '14 Out, 2024', descricao: 'Consulta Clínica Geral - Luna', cliente: 'Cliente: Maria Oliveira', categoria: 'Serviço', valor: 180, tipo: 'Receita', status: 'Pago' },
    { data: '13 Out, 2024', descricao: 'Manutenção Ar Condicionado', cliente: 'Empresa: ClimaCool', categoria: 'Infra', valor: -350, tipo: 'Despesa', status: 'Pago' }
  ];

  get transacoesFiltradas() {
    return this.transacoes.filter(t => {
      const texto = `${t.descricao} ${t.cliente} ${t.categoria} ${t.status}`.toLowerCase();
      return texto.includes(this.busca.toLowerCase());
    });
  }

  get receitaTotal() {
    return this.transacoes.filter(t => t.valor > 0).reduce((total, t) => total + t.valor, 0);
  }

  get despesasTotal() {
    return Math.abs(this.transacoes.filter(t => t.valor < 0).reduce((total, t) => total + t.valor, 0));
  }

  get saldoTotal() {
    return this.receitaTotal - this.despesasTotal;
  }

  get pendentesTotal() {
    return Math.abs(this.transacoes.filter(t => t.status === 'Pendente').reduce((total, t) => total + t.valor, 0));
  }

  alterarPeriodoFluxo(periodo: string) {
    this.periodoFluxo = periodo;
  }

  abrirModal() {
    this.novaTransacao = {
      data: '',
      descricao: '',
      cliente: '',
      categoria: 'Serviço',
      valor: 0,
      tipo: 'Receita',
      status: 'Pago'
    };

    this.modalAberto = true;
  }

  fecharModal() {
    this.modalAberto = false;
  }

  salvarTransacao() {
    if (!this.novaTransacao.data || !this.novaTransacao.descricao || !this.novaTransacao.valor) {
      alert('Preencha data, descrição e valor.');
      return;
    }

    const valorFinal =
      this.novaTransacao.tipo === 'Despesa'
        ? -Math.abs(this.novaTransacao.valor)
        : Math.abs(this.novaTransacao.valor);

    this.transacoes.unshift({
      data: this.formatarData(this.novaTransacao.data),
      descricao: this.novaTransacao.descricao,
      cliente: this.novaTransacao.cliente || 'Sem identificação',
      categoria: this.novaTransacao.categoria,
      valor: valorFinal,
      tipo: this.novaTransacao.tipo,
      status: this.novaTransacao.status
    });

    this.fecharModal();
  }

  formatarData(data: string) {
    const partes = data.split('-');
    return `${partes[2]} Out, ${partes[0]}`;
  }

  formatarMoeda(valor: number) {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }

  abrirMenu(index: number) {
    this.menuAberto = this.menuAberto === index ? null : index;
  }

  marcarComoPago(transacao: any) {
    transacao.status = 'Pago';
    this.menuAberto = null;
  }

  marcarComoPendente(transacao: any) {
    transacao.status = 'Pendente';
    this.menuAberto = null;
  }

  excluirTransacao(transacao: any) {
    const confirmar = confirm(`Deseja excluir "${transacao.descricao}"?`);

    if (confirmar) {
      this.transacoes = this.transacoes.filter(t => t !== transacao);
    }

    this.menuAberto = null;
  }

  exportarRelatorio() {
    const cabecalho = 'Data;Descrição;Categoria;Valor;Status\n';

    const conteudo = this.transacoes
      .map(t => `${t.data};${t.descricao};${t.categoria};${this.formatarMoeda(t.valor)};${t.status}`)
      .join('\n');

    const arquivo = new Blob([cabecalho + conteudo], {
      type: 'text/csv;charset=utf-8;'
    });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(arquivo);
    link.download = 'relatorio-financeiro-petvitaliz.csv';
    link.click();
  }
}