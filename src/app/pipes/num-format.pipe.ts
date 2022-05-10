import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'numFormat'
})
export class NumFormatPipe implements PipeTransform {

  transform(input: any, args?: any): any {
    if (input === undefined) {
      return input;
    }
    if (typeof input === "string" && !Number.isNaN(Number(input)))
      input = Number(input)
    else if (typeof input === "string")
      return input

    if (Number.isNaN(input)) {
      return '-';
    }

    if (input < 1000) {
      return input;
    }

    return input.toString().slice(0, input.toString().length - 3) + ',' + input.toString().slice(-3);


  }

}
