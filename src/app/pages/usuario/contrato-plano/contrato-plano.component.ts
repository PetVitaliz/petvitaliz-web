import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-contrato-plano',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contrato-plano.component.html',
  styleUrl: './contrato-plano.component.css'
})
export class ContratoPlanoComponent implements OnInit {

  plano: any = null;
  aceitou = false;
  processandoContratacao = false;
  erroContrato = '';

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    this.plano = JSON.parse(
      localStorage.getItem('planoSelecionado') || 'null'
    );

    if (!this.plano) {
      this.router.navigate(['/user/planos-pet']);
    }
  }

  aceitarContrato(): void {
    this.erroContrato = '';

    if (!this.aceitou) {
      this.erroContrato = 'Você deve marcar a caixa confirmando a leitura e aceitação dos termos contratuais.';
      return;
    }

    this.processandoContratacao = true;

    const payload = {
      id_produto: Number(this.plano.id_produto)
    };

    this.http.post(`${environment.apiUrl}/user/planos/pagamento`, payload, { withCredentials: true })
      .subscribe({
        next: (res: any) => {
          localStorage.setItem('planoAtivo', 'true');
          this.processandoContratacao = false;
          this.router.navigate(['/user/plano-sucesso']);
        },
        error: (err) => {
          this.processandoContratacao = false;
          console.error('Erro retornado pelo backend:', err);
          
          this.erroContrato = err.error?.mensagem || 'Falha ao processar assinatura.';
          
          this.buscarPlanoOriginalDoBancoESalvar();
        }
      });
  }

  private buscarPlanoOriginalDoBancoESalvar(): void {
    this.http.get(`${environment.apiUrl}/user/planos`, { withCredentials: true }).subscribe({
      next: (response: any) => {
        if (response && response.tem_plano && response.include) {
          localStorage.setItem('planoSelecionado', JSON.stringify({
            nome: response.include.nome.split(' | ')[0],
            preco: response.include.preco,
            descricao: response.include.descricao
          }));
        } else {
          localStorage.removeItem('planoSelecionado');
        }
      }
    });
  }
}