import { Injectable } from '@angular/core';

export interface ConsultaFuncionario {
    id?: number;
    hora: string;
    horario: string;
    periodo: string;
    pet: string;
    idade: string;
    tutor: string;
    motivo: string;
    status: string;
    data: string;
    imagem: string;
    tipo: string;
}

@Injectable({
    providedIn: 'root'
})
export class ConsultasService {

    private storageKey = 'consultasFuncionario';

    private consultas: ConsultaFuncionario[] = [];

    constructor() {
        this.carregarConsultas();
    }

    private consultasIniciais(): ConsultaFuncionario[] {
        return [
            {
                id: 1,
                hora: '09:00',
                horario: '09:00',
                periodo: 'AM',
                pet: 'Thor',
                idade: '3 anos',
                tutor: 'Ricardo Alencar',
                motivo: 'Vacinação Anual',
                status: 'CONFIRMADO',
                data: '2026-10-23',
                imagem: 'assets/pets/thor.jpg',
                tipo: 'green'
            },
            {
                id: 2,
                hora: '10:00',
                horario: '10:00',
                periodo: 'AM',
                pet: 'Luna',
                idade: '2 anos',
                tutor: 'Maria Silva',
                motivo: 'Consulta de rotina',
                status: 'CONFIRMADO',
                data: '2026-10-23',
                imagem: 'assets/pets/luna.jpg',
                tipo: 'green'
            },
            {
                id: 3,
                hora: '11:00',
                horario: '11:00',
                periodo: 'AM',
                pet: 'Max',
                idade: '4 anos',
                tutor: 'João Souza',
                motivo: 'Retorno',
                status: 'CONFIRMADO',
                data: '2026-10-23',
                imagem: 'assets/pets/max.jpg',
                tipo: 'green'
            },
            {
                id: 4,
                hora: '14:00',
                horario: '14:00',
                periodo: 'PM',
                pet: 'Mel',
                idade: '1 ano',
                tutor: 'Ana Paula',
                motivo: 'Vacinação',
                status: 'CONFIRMADO',
                data: '2026-10-23',
                imagem: 'assets/pets/mel.jpg',
                tipo: 'green'
            }
        ];
    }

    private carregarConsultas(): void {
        const dadosSalvos = localStorage.getItem(this.storageKey);

        if (dadosSalvos) {
            this.consultas = JSON.parse(dadosSalvos);
            return;
        }

        this.consultas = this.consultasIniciais();
        this.salvarNoStorage();
    }

    private salvarNoStorage(): void {
        localStorage.setItem(this.storageKey, JSON.stringify(this.consultas));
    }

    listarConsultas(): ConsultaFuncionario[] {
        const dadosSalvos = localStorage.getItem(this.storageKey);

        if (dadosSalvos) {
            this.consultas = JSON.parse(dadosSalvos);
        }

        return [...this.consultas];
    }

    adicionarConsulta(consulta: ConsultaFuncionario): void {
        consulta.id = this.gerarNovoId();

        this.consultas.push(consulta);

        this.salvarNoStorage();
    }

    atualizarStatus(consulta: ConsultaFuncionario, status: string): void {
        consulta.status = status;
        consulta.tipo = this.definirTipo(status);

        this.salvarNoStorage();
    }

    definirTipo(status: string): string {
        if (status === 'CONFIRMADO') return 'green';
        if (status === 'URGENTE') return 'red';
        return 'gray';
    }

    salvarAlteracoes(): void {
        this.salvarNoStorage();
    }

    removerConsulta(consulta: ConsultaFuncionario): void {
        this.consultas = this.consultas.filter(c => c !== consulta);
        this.salvarNoStorage();
    }

    private gerarNovoId(): number {
        if (this.consultas.length === 0) {
            return 1;
        }

        return Math.max(...this.consultas.map(c => c.id || 0)) + 1;
    }
}