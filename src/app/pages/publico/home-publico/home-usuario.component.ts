import { Component, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { HeaderUsuarioComponent } from '../../usuario/header-usuario/header-usuario.component';

type ServicoHome = {
  titulo: string;
  imagem: string;
  tags: string[];
};

@Component({
  selector: 'app-home-usuario',
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderUsuarioComponent],
  templateUrl: './home-usuario.component.html',
  styleUrl: './home-usuario.component.css'
})
export class HomeUsuarioComponent implements OnInit {
  imgGatoAmarelo = 'assets/img/cat.png';
  imgCachorros = 'assets/img/dogs.png';
  imgCachorroCoracao = 'assets/img/dog.png';
  imgGatoDeitado = 'assets/img/gato.png';
  imgPataFundo = 'assets/img/banner.png';
  imgPataPlanos = '';
  imgFinalHome = 'assets/img/cachorro-feliz.png';

  servicoSelecionado = 0;
  planos: any[] = [];
  carregandoPlanos = true;

  doutores = [
    { nome: 'Dr. Pedro', imagem: 'assets/img/doctor1.png', experiencia: '10+ Anos de Experiência' },
    { nome: 'Dra. Carla', imagem: 'assets/img/doctor2.png', experiencia: '8+ Anos de Experiência' },
    { nome: 'Dr. Rogério', imagem: 'assets/img/doctor3.png', experiencia: '12+ Anos de Experiência' },
    { nome: 'Dra. Ana', imagem: 'assets/img/doctor4.png', experiencia: '6+ Anos de Experiência' }
  ];

  servicosHome: ServicoHome[] = [
    { titulo: 'Suprimento de Pet', imagem: '', tags: ['Brinquedos', 'Acessórios'] },
    { titulo: 'Serviços de Higiene', imagem: '', tags: ['Corte de Unhas', 'Limpeza de Ouvido'] },
    { titulo: 'Suporte Veterinario', imagem: '', tags: ['Check-Ups', 'Vacinação'] },
    { titulo: 'Assistencia com Adoção', imagem: '', tags: ['Abrigos locais', 'Pet Perfeito'] },
    { titulo: 'Hospedagem & Creche Para Pets', imagem: '', tags: ['Hora de Brincar', 'Alimentação'] }
  ];

  avaliacoes = [
    { nome: 'Mariana Silva', texto: 'O Plano Abrangente salvou as vacinas do meu Golden! Atendimento maravilhoso.' },
    { nome: 'Ricardo Santos', texto: 'A clínica é linda, limpa e os veterinários tratam os pets com muito amor.' }
  ];

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.buscarPlanosCadastrados();
  }

  buscarPlanosCadastrados(): void {
    this.carregandoPlanos = true;
    this.http.get(`${environment.apiUrl}/adm/listar/produtos`, { withCredentials: true }).subscribe({
      next: (response: any) => {
        if (response && response.produtos) {
          this.planos = response.produtos.map((p: any) => {
            const partesNome = p.nome.split(' | ');
            return {
              id_produto: p.id_produto,
              tag: partesNome[1] || 'PLANO ATIVO',
              nome: partesNome[0],
              preco: p.preco,
              descricao: p.descricao,
              beneficiosArray: p.beneficios
                ? p.beneficios.split(/[\n,;]+/).map((b: string) => b.trim()).filter((b: string) => b.length > 0)
                : []
            };
          });
        }
        this.carregandoPlanos = false;
      },
      error: (err) => {
        console.error('Erro ao buscar planos:', err);
        this.carregandoPlanos = false;
      }
    });
  }

  inscreverNoPlano(plano: any): void {
    localStorage.setItem('planoSelecionado', JSON.stringify(plano));

    if (this.router.url.includes('/user/home')) {
      this.router.navigate(['/user/contrato-plano']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  selecionarServico(index: number): void {
    this.servicoSelecionado = index;
  }
}