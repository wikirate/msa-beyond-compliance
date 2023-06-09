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

    const food_and_bev_assessed_statements = this.dataProvider.getAnswers(
      this.dataProvider.metrics.msa_statement_assessed, [
        new Filter("year", this.year),
        new Filter('value', 'Yes'),
        new Filter("company_group", this.dataProvider.company_groups.food_and_beverage)
      ])

    const food_and_bev_disclosure_rates = this.dataProvider.getAnswers(
      this.dataProvider.metrics.msa_disclosure_rate, [
        new Filter("year", this.year),
        new Filter("company_group", this.dataProvider.company_groups.food_and_beverage)
      ]
    )

    const garment_assessed_statements = this.dataProvider.getAnswers(
      this.dataProvider.metrics.msa_statement_assessed, [
        new Filter("year", this.year),
        new Filter('value', 'Yes'),
        new Filter("company_group", this.dataProvider.company_groups.garment)
      ])

    const garment_disclosure_rates = this.dataProvider.getAnswers(
      this.dataProvider.metrics.msa_disclosure_rate, [
        new Filter("year", this.year),
        new Filter("company_group", this.dataProvider.company_groups.garment)
      ]
    )

    const financial_assessed_statements = this.dataProvider.getAnswers(
      this.dataProvider.metrics.msa_statement_assessed, [
        new Filter("year", this.year),
        new Filter('value', 'Yes'),
        new Filter("company_group", this.dataProvider.company_groups.financial)
      ])

    const financial_disclosure_rates = this.dataProvider.getAnswers(
      this.dataProvider.metrics.msa_disclosure_rate, [
        new Filter("year", this.year),
        new Filter("company_group", this.dataProvider.company_groups.financial)
      ]
    )

    const hospitality_assessed_statements = this.dataProvider.getAnswers(
      this.dataProvider.metrics.msa_statement_assessed, [
        new Filter("year", this.year),
        new Filter('value', 'Yes'),
        new Filter("company_group", this.dataProvider.company_groups.hospitality)
      ])

    const hospitality_disclosure_rates = this.dataProvider.getAnswers(
      this.dataProvider.metrics.msa_disclosure_rate, [
        new Filter("year", this.year),
        new Filter("company_group", this.dataProvider.company_groups.hospitality)
      ]
    )

    forkJoin([food_and_bev_assessed_statements, food_and_bev_disclosure_rates, garment_assessed_statements,
      garment_disclosure_rates, financial_assessed_statements, financial_disclosure_rates, hospitality_assessed_statements,
      hospitality_disclosure_rates]).subscribe(results => {
      this.food_bev_avg_disclosure_rate = this.calc_avg_disclosure_rate(results[0], results[1]);
      this.garment_avg_disclosure_rate = this.calc_avg_disclosure_rate(results[2], results[3]);
      this.financial_avg_disclosure_rate = this.calc_avg_disclosure_rate(results[4], results[5]);
      this.hospitality_avg_disclosure_rate = this.calc_avg_disclosure_rate(results[6], results[7]);

      this.isLoading = false;
    })
  }

  /**
   * Calculates the average disclosure rate given the array of the assessed statements and disclosure rates
   * @param assessed_statements
   * @param disclosure_rates
   * @private
   */
  private calc_avg_disclosure_rate(assessed_statements: any, disclosure_rates: any): number {
    let avg_discosure_rate = 0;
    disclosure_rates = disclosure_rates.filter((a: { company: any; year: any; }) => assessed_statements.some((statement: { company: any; year: any; }) => statement.company == a.company && statement.year == a.year))
    for (let answer of disclosure_rates)
      avg_discosure_rate += answer['value'] == 'Unknown' ? 0 : Number(answer['value']);
    return Math.round(avg_discosure_rate / disclosure_rates.length)
  }

  openURL(sector: string) {
    let url = new WikirateUrlBuilder()
      .setEndpoint(this.dataProvider.metrics.msa_disclosure_rate)
      .addFilter(new Filter('company_group', sector))
      .addFilter(new Filter('year', this.year))
      .build();

    window.open(url, "_blank")
  }
}
