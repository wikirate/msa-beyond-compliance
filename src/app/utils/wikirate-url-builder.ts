import {Filter} from "../models/filter.model";
import {ValueRange} from "../models/valuerange.model";

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

    let url_suffix = ''
    for (let filter of this.filters) {
      if (Array.isArray(filter.value)) {
        for (let single_value of filter.value) {
          url_suffix += `filter[${filter.name}][]=${single_value}&`
        }
      } else if (filter.value instanceof ValueRange) {
        url_suffix += `filter[${filter.name}][from]=${filter.value.from}&`
        url_suffix += `filter[${filter.name}][to]=${filter.value.to}&`
      } else {
        url_suffix += `filter[${filter.name}][]=${filter.value}&`
      }
    }

    return `${url}?${url_suffix}`
  }

}
