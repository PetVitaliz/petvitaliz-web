import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-emergencia',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './emergencia.component.html',
  styleUrl: './emergencia.component.css'
})
export class EmergenciaComponent {

  imgVeterinaria = '';
  imgPataEmergencia = '';
  imgEmergenciaInfo = '';

cardsEmergencia = [
  {
    numero: '',
    titulo: 'Controlar sangramento',
    descricao: 'Controle o sangramento aplique pressão suave na ferida usando um pano limpo ou bandagem para estancar o sangramento. Evite usar um torniquete, a menos que seja absolutamente necessário e apenas por curtos períodos.'
  },

  {
    numero: '',
    titulo: 'Realize RCP (se necessário)',
    descricao: 'Se o seu animal de estimação não estiver respirando, faça RCP. Para pequenos animais de estimação, cubra tanto o nariz quanto a boca deles com a sua boca e dê respirações suaves.'
  },

  {
    numero: '',
    titulo: 'Lidar com engasgo',
    descricao: 'Verifique a boca do seu animal de estimação em busca de objetos visíveis. Use pinças para removê-los com cuidado. Se não tiver sucesso, realize a manobra de Heimlich aplicando pressão no abdômen ou no peito.'
  },

  {
    numero: '',
    titulo: 'Estabilizar ossos quebrados',
    descricao: 'Mantenha seu animal de estimação o mais parado possível. Use uma tala improvisada, como uma toalha enrolada ou material macio, para estabilizar a área lesionada sem aplicar pressão excessiva.'
  }
];

imgLinha24h = '';
imgComoFunciona = '';
imgSinaisEmergencia = '';

}