import {Component, Input, OnInit, SimpleChanges} from '@angular/core';
import {DataProvider} from "../../services/data.provider";
import {Filter} from "../../models/filter.model";
// @ts-ignore
import beyond_compliance_metrics from "../../../assets/charts-params/beyond-compliance-metrics.json";

@Component({
  selector: 'disclosure-rates',
  templateUrl: './disclosure-rates.component.html',
  styleUrls: ['./disclosure-rates.component.scss']
})
export class DisclosureRatesComponent implements OnInit {
  year: number | string = ''
  isLoading: boolean = true;
  garment_avg_disclosure_rate: number = 0;
  financial_avg_disclosure_rate: number = 0;
  hospitality_avg_disclosure_rate: number = 0;

  constructor(private dataProvider: DataProvider) {
  }

  ngOnInit() {
    this.updateDisclosureRates()
  }

  updateDisclosureRates() {
    this.isLoading = true;
    this.dataProvider.getAnswers(
      this.dataProvider.metrics.uk_msa_statement_assessed, [
        new Filter("year", this.year),
        new Filter('value', 'Yes'),
        new Filter("company_group", "MSA Garment")
      ]
    ).subscribe(uk_assessed => {
      let uk_msa_statements_assessed = uk_assessed.map((a: { [x: string]: any; }) => {
        return {company: a['company'], year: a['year']}
      })
      this.dataProvider.getAnswers(
        this.dataProvider.metrics.aus_msa_statement_assessed, [new Filter("year", this.year), new Filter('value', 'Yes'),
          new Filter("company_group", "MSA Garment")]
      ).subscribe(aus_assessed => {
        let aus_msa_statements_assessed: any[] = aus_assessed.map((a: { [x: string]: any; }) => {
          return {company: a['company'], year: a['year']}
        })
        let total_assessed = [...new Set([...uk_msa_statements_assessed, ...aus_msa_statements_assessed])];
        total_assessed = total_assessed.filter((arr, index, self) =>
          index === self.findIndex((t) => (t.company === arr.company && t.year === arr.year)))
        this.dataProvider.getAnswers(
          this.dataProvider.metrics.msa_disclosure_rate, [
            new Filter("year", this.year),
            new Filter("company_group", "MSA Garment")
          ]
        ).subscribe(disclosure_rates => {
          this.garment_avg_disclosure_rate = 0;
          for (let answer of disclosure_rates) {
            if (total_assessed.find((item: { company: any; year: any; }) => {
              return item['company'] == answer['company'] && item['year'] == answer['year']
            }) !== undefined) {
              this.garment_avg_disclosure_rate += Number(answer['value']);
            }
          }
          this.garment_avg_disclosure_rate = Math.round(this.garment_avg_disclosure_rate / total_assessed.length)
          this.dataProvider.getAnswers(
            this.dataProvider.metrics.uk_msa_statement_assessed, [
              new Filter("year", this.year),
              new Filter('value', 'Yes'),
              new Filter("company_group", "MSA Financial")
            ]
          ).subscribe(uk_assessed => {
            let uk_msa_statements_assessed = uk_assessed.map((a: { [x: string]: any; }) => {
              return {company: a['company'], year: a['year']}
            })
            this.dataProvider.getAnswers(
              this.dataProvider.metrics.aus_msa_statement_assessed, [new Filter("year", this.year), new Filter('value', 'Yes'),
                new Filter("company_group", "MSA Financial")]
            ).subscribe(aus_assessed => {
              let aus_msa_statements_assessed: any[] = aus_assessed.map((a: { [x: string]: any; }) => {
                return {company: a['company'], year: a['year']}
              })
              let total_assessed = [...new Set([...uk_msa_statements_assessed, ...aus_msa_statements_assessed])];
              total_assessed = total_assessed.filter((arr, index, self) =>
                index === self.findIndex((t) => (t.company === arr.company && t.year === arr.year)))
              this.dataProvider.getAnswers(
                this.dataProvider.metrics.msa_disclosure_rate, [
                  new Filter("year", this.year),
                  new Filter("company_group", "MSA Financial")
                ]
              ).subscribe(disclosure_rates => {
                this.financial_avg_disclosure_rate = 0;
                for (let answer of disclosure_rates) {
                  if (total_assessed.find((item: { company: any; year: any; }) => {
                    return item['company'] == answer['company'] && item['year'] == answer['year']
                  }) !== undefined) {
                    this.financial_avg_disclosure_rate += Number(answer['value']);
                  }
                }
                this.financial_avg_disclosure_rate = Math.round(this.financial_avg_disclosure_rate / total_assessed.length)
              })
            })
          })
          this.dataProvider.getAnswers(
            this.dataProvider.metrics.uk_msa_statement_assessed, [
              new Filter("year", this.year),
              new Filter('value', 'Yes'),
              new Filter("company_group", "MSA Hospitality")
            ]
          ).subscribe(uk_assessed => {
            let uk_msa_statements_assessed = uk_assessed.map((a: { [x: string]: any; }) => {
              return {company: a['company'], year: a['year']}
            })
            this.dataProvider.getAnswers(
              this.dataProvider.metrics.aus_msa_statement_assessed, [new Filter("year", this.year), new Filter('value', 'Yes'),
                new Filter("company_group", "MSA Hospitality")]
            ).subscribe(aus_assessed => {
              let aus_msa_statements_assessed: any[] = aus_assessed.map((a: { [x: string]: any; }) => {
                return {company: a['company'], year: a['year']}
              })
              let total_assessed = [...new Set([...uk_msa_statements_assessed, ...aus_msa_statements_assessed])];
              total_assessed = total_assessed.filter((arr, index, self) =>
                index === self.findIndex((t) => (t.company === arr.company && t.year === arr.year)))
              this.dataProvider.getAnswers(
                this.dataProvider.metrics.msa_disclosure_rate, [
                  new Filter("year", this.year),
                  new Filter("company_group", "MSA Hospitality")
                ]
              ).subscribe(disclosure_rates => {
                this.hospitality_avg_disclosure_rate = 0;
                for (let answer of disclosure_rates) {
                  if (total_assessed.find((item: { company: any; year: any; }) => {
                    return item['company'] == answer['company'] && item['year'] == answer['year']
                  }) !== undefined) {
                    this.hospitality_avg_disclosure_rate += Number(answer['value']);
                  }
                }
                this.hospitality_avg_disclosure_rate = Math.round(this.hospitality_avg_disclosure_rate / total_assessed.length)
              }, (error) => console.log(error), () => this.isLoading = false)
            })
          })
        })

      })
    })
  }
}
