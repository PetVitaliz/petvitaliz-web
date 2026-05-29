import { Directive, HostListener, ElementRef, Input } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appDataMask]',
  standalone: true
})
export class DataMaskDirective {
  @Input('appDataMask') maskType: 'date' | 'cpf' | 'phone' | '' = 'date';

  constructor(private el: ElementRef, private ngControl: NgControl) {}

  @HostListener('input', ['$event'])
  onInputChange(event: any) {
    if (event.inputType === 'deleteContentBackward') {
      return;
    }

    const input = this.el.nativeElement;
    let v = input.value.replace(/\D/g, '');

    if (this.maskType === 'cpf') {
      v = this.aplicarMarcaraCpf(v);
    } else if (this.maskType === 'phone') {
      v = this.aplicarMascaraTelefone(v);
    } else {
      v = this.aplicarMascaraData(v);
    }

    input.value = v;

    if (this.ngControl && this.ngControl.control) {
      this.ngControl.control.setValue(v, { emitEvent: false });
    }
  }

  private aplicarMascaraData(v: string): string {
    if (v.length > 8) v = v.slice(0, 8);
    if (v.length >= 2) v = v.substring(0, 2) + '/' + v.substring(2);
    if (v.length >= 5) v = v.substring(0, 5) + '/' + v.substring(5, 9);
    return v;
  }

  private aplicarMarcaraCpf(v: string): string {
    if (v.length > 11) v = v.slice(0, 11);
    if (v.length <= 3) return v;
    if (v.length <= 6) return v.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    if (v.length <= 9) return v.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    return v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
  }

  private aplicarMascaraTelefone(v: string): string {
    if (v.length > 11) v = v.slice(0, 11);
    if (v.length <= 2) return v;
    if (v.length <= 6) return v.replace(/(\d{2})(\d{1,4})/, '($1) $2');
    if (v.length <= 10) return v.replace(/(\d{2})(\d{4})(\d{1,4})/, '($1) $2-$3');
    return v.replace(/(\d{2})(\d{5})(\d{1,4})/, '($1) $2-$3');
  }
}
