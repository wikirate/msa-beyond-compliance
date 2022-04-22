import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {Filter} from "../models/filter.model";

@Injectable()
export class DataProvider {
  wikirateApiHost = "https://wikirate.org"

  metrics = {
    msa_registry_submission: 12536930,
    aus_msa_statement_assessed: 12602630,
    uk_msa_statement_assessed: 12602618,
    meet_uk_min_requirements: 6901749,
    meet_aus_min_requirements: 12601871,
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
      } else {
        params = params.append("filter[" + filter.name + "]", filter.value)
      }
    }
    params = params.append("limit", 0)
    params = params.append("view", "answer_list")
    return this.httpClient.get<any>(url, {params: params})
  }


}
