import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {Filter} from "../models/filter.model";
import {ValueRange} from "../models/valuerange.model";

@Injectable()
export class DataProvider {
  wikirateApiHost = "https://wikirate.org"

  metrics = {
    msa_registry_submission: 12536930,
    modern_slavery_statement: 1827651,
    aus_msa_statement_assessed: 12602630,
    uk_msa_statement_assessed: 12602618,
    meet_uk_min_requirements: 6901749,
    meet_aus_min_requirements: 12601871,
    aus_beyond_compliance_disclosure_rate: 12620676,
    uk_beyond_compliance_disclosure_rate: 6899063,
    msa_beyond_compliance: 12620974,
    msa_disclosure_rate: 12602527
  }

  constructor(private httpClient: HttpClient) {
  }

  getAnswers(metric_id: number, filters: Filter[]) {
    let url = `${this.wikirateApiHost}/~${metric_id}+Answer.json`
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
    return this.httpClient.get<any>(url, {params: params})
  }

  getCompanyGroup(sector: string | null) {
    if (sector === 'garment-sector') {
      return "MSA Garments"
    } else if (sector === 'hospitality-sector') {
      return "MSA Hospitality"
    } else if (sector === 'financial-sector') {
      return "MSA Financial"
    } else {
      return ""
    }

  }


}
