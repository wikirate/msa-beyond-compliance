import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'percentageFormat'
})
export class PercentageFormatPipe implements PipeTransform {

  transform(input: any, args?: any): any {
    if (input === undefined) {
      return '-';
    }
    if (typeof input === "string" && !Number.isNaN(Number(input)))
      input = Number(input) +'%'
    else if (typeof input === "string")
      return input
    else if (Number.isNaN(input))
      return '-';
    return input +'%';


  }

}
