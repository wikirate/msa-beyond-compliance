import {ValueRange} from "./valuerange.model";

export class Filter {
  constructor(public name: string, public value: string | number | any[] | ValueRange) {
  }
}
