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
      this.dataProvider.metrics.msa_statement_assessed, [
        new Filter("year", this.year),
        new Filter('value', 'Yes'),
        new Filter("company_group", "MSA Garment")
      ]
    ).subscribe(assessed => {
      this.dataProvider.getAnswers(
        this.dataProvider.metrics.msa_disclosure_rate, [
          new Filter("year", this.year),
          new Filter("company_group", "MSA Garment")
        ]
      ).subscribe(disclosure_rates => {
        this.garment_avg_disclosure_rate = 0;
        disclosure_rates = disclosure_rates.filter((a: { company: any; year: any; }) => assessed.some((statement: { company: any; year: any; }) => statement.company == a.company && statement.year == a.year))
        for (let answer of disclosure_rates) {
          this.garment_avg_disclosure_rate += Number(answer['value']);
        }
        this.garment_avg_disclosure_rate = Math.round(this.garment_avg_disclosure_rate / disclosure_rates.length)
        this.dataProvider.getAnswers(
          this.dataProvider.metrics.msa_statement_assessed, [
            new Filter("year", this.year),
            new Filter('value', 'Yes'),
            new Filter("company_group", "MSA Financial")
          ]
        ).subscribe(assessed => {
          this.dataProvider.getAnswers(
            this.dataProvider.metrics.msa_disclosure_rate, [
              new Filter("year", this.year),
              new Filter("company_group", "MSA Financial")
            ]
          ).subscribe(disclosure_rates => {
            this.financial_avg_disclosure_rate = 0;
            disclosure_rates = disclosure_rates.filter((a: { company: any; year: any; }) => assessed.some((statement: { company: any; year: any; }) => statement.company == a.company && statement.year == a.year))
            for (let answer of disclosure_rates) {
              this.financial_avg_disclosure_rate += Number(answer['value']);
            }
            this.financial_avg_disclosure_rate = Math.round(this.financial_avg_disclosure_rate / disclosure_rates.length)
          })
        })
      })
      this.dataProvider.getAnswers(
        this.dataProvider.metrics.msa_statement_assessed, [
          new Filter("year", this.year),
          new Filter('value', 'Yes'),
          new Filter("company_group", "MSA Hospitality")
        ]
      ).subscribe(assessed => {
        this.dataProvider.getAnswers(
          this.dataProvider.metrics.msa_disclosure_rate, [
            new Filter("year", this.year),
            new Filter("company_group", "MSA Hospitality")
          ]
        ).subscribe(disclosure_rates => {
          this.hospitality_avg_disclosure_rate = 0;
          disclosure_rates = disclosure_rates.filter((a: { company: any; year: any; }) => assessed.some((statement: { company: any; year: any; }) => statement.company == a.company && statement.year == a.year))
          for (let answer of disclosure_rates) {
            this.hospitality_avg_disclosure_rate += Number(answer['value']);
          }
          this.hospitality_avg_disclosure_rate = Math.round(this.hospitality_avg_disclosure_rate / disclosure_rates.length)
        }, (error) => console.log(error), () => this.isLoading = false)
      })
    })
  }
}
