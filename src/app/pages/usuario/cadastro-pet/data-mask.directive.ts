import { Directive, HostListener, ElementRef } from '@angular/core';

@Directive({
  selector: '[appDataMask]',
  standalone: true
})
export class DataMaskDirective {

  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event'])
  onInputChange(event: any) {
    const input = this.el.nativeElement;
    let v = input.value.replace(/\D/g, '');

    if (event.inputType === 'deleteContentBackward') {
      return;
    }

    if (v.length >= 2) {
      v = v.substring(0, 2) + '/' + v.substring(2);
    }

    if (v.length >= 5) {
      v = v.substring(0, 5) + '/' + v.substring(5, 9);
    }

    if (v.length > 10) {
      v = v.substring(0, 10);
    }

    input.value = v;
  }
}