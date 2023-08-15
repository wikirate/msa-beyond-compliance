import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {Filter} from "../models/filter.model";
import {ValueRange} from "../models/valuerange.model";
import {Observable, of, tap} from "rxjs";

@Injectable()
export class DataProvider {
  private cache: { [url: string]: any } = {};

  wikirateApiHost = "https://wikirate.org"

  company_groups = {
    garment: '~12619141',
    food_and_beverage: '~14545138',
    hospitality: '~12619144',
    financial: '~12620271',
    renewable_energy: '~13923591',
    none: ''
  }

  companies_with_assessed_statement = {
    uk: "Companies_with_assessed_UK_MSA_statement",
    aus: "Companies_with_assessed_Australian_MSA_statement",
    any: "Companies_with_assessed_MSA_statement"
  }

  sectors = {
    'all-sectors': 'All Sectors',
    'food-and-beverage': 'Food & Beverage',
    'garment-sector': 'Garment',
    'financial-sector': 'Financial',
    'hospitality-sector': 'Hospitality',
    'renewable-energy': '(Renewable) Energy'
  }

  metrics = {
    msa_registry_submission: 12536930,
    modern_slavery_statement: 1827651,
    msa_statement_assessed: 12621772,
    aus_msa_statement_assessed: 12602630,
    uk_msa_statement_assessed: 12602618,
    meet_uk_min_requirements: 6901749,
    meet_aus_min_requirements: 12601871,
    msa_meet_min_requirements: 12642257,
    aus_beyond_compliance_disclosure_rate: 12620676,
    uk_beyond_compliance_disclosure_rate: 6899063,
    msa_beyond_compliance: 12620974,
    msa_disclosure_rate: 12602527,
    turnover_range: 8218724,
    msa_incidents_identified: 1831964,
    msa_policy_beyond_t1: 6915846,
    msa_risks_identified: 6916242
  }

  constructor(private httpClient: HttpClient) {
  }

  getAnswers(metric_id: number, filters: Filter[]) {
    let url = `${this.wikirateApiHost}/~${metric_id}+Answer.json`

    return this.get<any>(url, DataProvider.getParams(filters))
  }

  static getParams(filters: Filter[]): HttpParams {
    let params = new HttpParams();
    for (let filter of filters) {
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
    params = params.append("limit", 0)
    params = params.append("view", "answer_list")
    return params;
  }

  getCompanyGroup(sector: string | null) {
    if (sector === 'garment-sector') {
      return this.company_groups.garment
    } else if (sector === 'food-and-beverage') {
      return this.company_groups.food_and_beverage
    } else if (sector === 'hospitality-sector') {
      return this.company_groups.hospitality
    } else if (sector === 'financial-sector') {
      return this.company_groups.financial
    } else if (sector === 'renewable-energy') {
      return this.company_groups.renewable_energy
    } else {
      return this.company_groups.none
    }
  }

  get<T>(url: string, params: HttpParams = new HttpParams(), useCache: boolean = true): Observable<T> {
    const cacheKey = url + JSON.stringify(params);

    if (useCache && this.cache[cacheKey]) {
      return of(this.cache[cacheKey]);
    }
    return this.httpClient.get<T>(url, {params: params}).pipe(
      tap(data => {
        this.cache[cacheKey] = data;
      })
    );
  }

  clearCache() {
    this.cache = {};
  }


}
