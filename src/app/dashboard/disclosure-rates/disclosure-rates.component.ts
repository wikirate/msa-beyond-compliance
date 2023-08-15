import {Component, OnInit} from '@angular/core';
import {DataProvider} from "../../services/data.provider";
import {Filter} from "../../models/filter.model";
// @ts-ignore
import beyond_compliance_metrics from "../../../assets/charts-params/beyond-compliance-metrics.json";
import {SectorProvider} from "../../services/sector.provider";
import {ActivatedRoute} from "@angular/router";
import {ValueRange} from "../../models/valuerange.model";
import {forkJoin} from "rxjs";
import {WikirateUrlBuilder} from "../../utils/wikirate-url-builder";

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
  food_bev_avg_disclosure_rate: number = 0;

  constructor(private dataProvider: DataProvider, private sectorProvider: SectorProvider,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.updateData()
    this.route.url.subscribe(val => {
      if (val[1].path === 'disclosure-rates')
        this.sectorProvider.getPath().next(val[1].path)
    })
  }

  /**
   * Update Data function calculates the average disclosure rate per selected sector and year. We are taking here into
   * consideration only assessed statements into the calculation.
   */
  updateData() {
    this.isLoading = true;

    const food_and_bev_disclosure_rates = this.dataProvider.getAnswers(
      this.dataProvider.metrics.msa_disclosure_rate, [
        new Filter("year", this.year),
        new Filter("company_group", [this.dataProvider.company_groups.food_and_beverage, this.dataProvider.companies_with_assessed_statement.any])
      ].filter(item => item.value != 'latest')
    )

    const garment_disclosure_rates = this.dataProvider.getAnswers(
      this.dataProvider.metrics.msa_disclosure_rate, [
        new Filter("year", this.year),
        new Filter("company_group", [this.dataProvider.company_groups.garment, this.dataProvider.companies_with_assessed_statement.any])
      ].filter(item => item.value != 'latest')
    )

    const financial_disclosure_rates = this.dataProvider.getAnswers(
      this.dataProvider.metrics.msa_disclosure_rate, [
        new Filter("year", this.year),
        new Filter("company_group", this.dataProvider.company_groups.financial)
      ].filter(item => item.value != 'latest')
    )

    const hospitality_disclosure_rates = this.dataProvider.getAnswers(
      this.dataProvider.metrics.msa_disclosure_rate, [
        new Filter("year", this.year),
        new Filter("company_group", this.dataProvider.company_groups.hospitality)
      ].filter(item => item.value != 'latest')
    )

    forkJoin([food_and_bev_disclosure_rates,
      garment_disclosure_rates, financial_disclosure_rates,
      hospitality_disclosure_rates]).subscribe(results => {

      if (this.year == 'latest') {
        results[0] = Object.values(results[0].reduce((r: any, o: any) => {
          r[o.company] = (r[o.company] && r[o.company].year > o.year) ? r[o.company] : o

          return r
        }, {}))

        results[1] = Object.values(results[1].reduce((r: any, o: any) => {
          r[o.company] = (r[o.company] && r[o.company].year > o.year) ? r[o.company] : o

          return r
        }, {}))

        results[2] = Object.values(results[2].reduce((r: any, o: any) => {
          r[o.company] = (r[o.company] && r[o.company].year > o.year) ? r[o.company] : o

          return r
        }, {}))

        results[3] = Object.values(results[3].reduce((r: any, o: any) => {
          r[o.company] = (r[o.company] && r[o.company].year > o.year) ? r[o.company] : o

          return r
        }, {}))
      }

      this.food_bev_avg_disclosure_rate = this.calc_avg_disclosure_rate(results[0]);
      this.garment_avg_disclosure_rate = this.calc_avg_disclosure_rate(results[1]);
      this.financial_avg_disclosure_rate = this.calc_avg_disclosure_rate(results[2]);
      this.hospitality_avg_disclosure_rate = this.calc_avg_disclosure_rate(results[3]);

      this.isLoading = false;
    })
  }

  /**
   * Calculates the average disclosure rate given the array of the assessed statements and disclosure rates
   * @param assessed_statements
   * @param disclosure_rates
   * @private
   */
  private calc_avg_disclosure_rate(disclosure_rates: any): number {
    let avg_discosure_rate = 0;
    for (let answer of disclosure_rates)
      avg_discosure_rate += answer['value'] == 'Unknown' ? 0 : Number(answer['value']);
    return Math.round(avg_discosure_rate / disclosure_rates.length)
  }

  openURL(sector: string) {
    let url = new WikirateUrlBuilder()
      .setEndpoint(this.dataProvider.metrics.msa_disclosure_rate)
      .addFilter(new Filter('company_group', [sector, this.dataProvider.companies_with_assessed_statement.any]))
      .addFilter(new Filter('year', this.year))
      .build();

    window.open(url, "_blank")
  }
}
