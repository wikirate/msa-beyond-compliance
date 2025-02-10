import { Component, OnInit } from '@angular/core';
import { DataProvider } from "../../services/data.provider";
import { Filter } from "../../models/filter.model";
import { SectorProvider } from "../../services/sector.provider";
import { ActivatedRoute } from "@angular/router";
import { forkJoin } from "rxjs";
import { WikirateUrlBuilder } from "../../utils/wikirate-url-builder";
import { ChartsService } from 'src/app/services/charts.service';

@Component({
  selector: 'disclosure-rates',
  templateUrl: './disclosure-rates.component.html',
  styleUrls: ['./disclosure-rates.component.scss']
})
export class DisclosureRatesComponent implements OnInit {
  year: number | string = '';
  isLoading: boolean = true;

  donutData: any[] = [];

  constructor(
    private dataProvider: DataProvider, 
    private sectorProvider: SectorProvider, 
    private chartsService: ChartsService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.updateData();
    this.route.url.subscribe(val => {
      if (val[1]?.path === 'disclosure-rates') {
        this.sectorProvider.getPath().next(val[1].path);
      }
    });
  }

  ngAfterViewChecked() {
    if (!this.isLoading && this.donutData.length) {
      this.donutData.forEach(donut => {
        const element = document.querySelector(`div#${donut.id}`);
        if (element && !element.hasAttribute('data-rendered')) {
          this.drawSemiDonutChart(donut.percentage, donut.id, donut.url);
          element.setAttribute('data-rendered', 'true');
        }
      });
    }
  }

  updateData() {
    this.isLoading = true;

    const sectors = [
      { key: 'food_and_beverage', label: 'Food & Beverage' },
      { key: 'garment', label: 'Garment' },
      { key: 'financial', label: 'Finance' },
      { key: 'hospitality', label: 'Hospitality' },
      { key: 'renewable_energy', label: '(Renewable) Energy' },
      { key: 'electronics', label: 'Electronics' }
    ];

    const requests = sectors.map(sector => this.dataProvider.getAnswers(
      this.dataProvider.metrics.msa_disclosure_rate, [
        new Filter("year", this.year),
        new Filter("company_group", [this.dataProvider.company_groups[sector.key], this.dataProvider.companies_with_assessed_statement.any])
      ].filter(item => item.value !== 'latest')
    ));

    const urls = sectors.map(sector => new WikirateUrlBuilder()
      .setEndpoint(this.dataProvider.metrics.msa_disclosure_rate)
      .addFilter(new Filter("year", this.year))
      .addFilter(new Filter("company_group", [this.dataProvider.company_groups[sector.key], this.dataProvider.companies_with_assessed_statement.any]))
      .build()
    );

    forkJoin(requests).subscribe(results => {
      if (this.year === 'latest') {
        results = results.map(data => this.reduceToLatestYear(data));
      }

      this.donutData = sectors.map((sector, index) => ({
        id: `semi-donut-disclosure-rates-${sector.key}`,
        label: sector.label,
        percentage: this.calc_avg_disclosure_rate(results[index]),
        url: urls[index]
      }));

      // Sort by percentage in descending order
      this.donutData.sort((a, b) => b.percentage - a.percentage);

      this.isLoading = false;
    });
  }

  private reduceToLatestYear(data: any[]): any[] {
    return Object.values(data.reduce((acc: any, item: any) => {
      acc[item.company] = (acc[item.company] && acc[item.company].year > item.year) ? acc[item.company] : item;
      return acc;
    }, {}));
  }

  private calc_avg_disclosure_rate(disclosure_rates: any[]): number {
    if (disclosure_rates.length === 0) return 0;
    const total = disclosure_rates.reduce((sum, rate) => {
      const value = rate['value'] === 'Unknown' ? 0 : Number(rate['value']);
      return sum + value;
    }, 0);
    return Math.round((total * 10) / disclosure_rates.length);
  }

  drawSemiDonutChart(percentage: number, elementId: string, url: string) {
    this.chartsService.drawSemiDonutChart(
      `${percentage}%`,
      `div#${elementId}`,
      [
        { id: 'Covered', percent: percentage, wikirate_page: url },
        { id: 'Not Covered', percent: 100 - percentage, wikirate_page: url }
      ],
      250,
      ["#fce2de", "#fc300f"],
      ["Covered", "Not Covered"],
      { renderer: "svg", actions: false }
    );
  }
}
