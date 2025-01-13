import {Filter} from "../models/filter.model";
import {ValueRange} from "../models/valuerange.model";
import { HttpParams } from "@angular/common/http";

export class WikirateUrlBuilder {
  private baseUrl: string = 'https://wikirate.org'
  private filters: Filter[];
  private endpoint: string = '';

  constructor() {
    this.filters = [];
  }

  public setEndpoint(endpoint: string | number) {
    this.endpoint = typeof endpoint === 'number' ? `~${endpoint}` : endpoint;
    return this;
  }

  public addFilter(filter: Filter) {
    this.filters.push(filter)
    return this;
  }

  public build(): string {
    let url = `${this.baseUrl}/${this.endpoint}`

    let params = new HttpParams();
    for (let filter of this.filters) {
      if (Array.isArray(filter.value)) {
        for (let single_value of filter.value) {
          params = params.append("filter[" + filter.name + "][]", single_value)
        }
      } else if (filter.value instanceof ValueRange) {
        params = params.append("filter[" + filter.name + "][from]", filter.value.from)
        params = params.append("filter[" + filter.name + "][to]", filter.value.to)
      } else {
        params = params.append("filter[" + filter.name + "]", filter.value)
      }
    }
    params = params.append("tab","answer")

    return `${url}?${params.toString()}`
  }

}
