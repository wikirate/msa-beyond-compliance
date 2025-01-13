import { Component, OnInit, SimpleChanges } from '@angular/core';
import { DataProvider } from "../../services/data.provider";
import { Filter } from "../../models/filter.model";
// @ts-ignore
import beyond_compliance_metrics from "../../../assets/charts-params/beyond-compliance-metrics.json"
import { ActivatedRoute, ParamMap } from "@angular/router";
import { SectorProvider } from "../../services/sector.provider";
import { forkJoin, map } from "rxjs";
import { ChartsService } from 'src/app/services/charts.service';
import { WikirateUrlBuilder } from 'src/app/utils/wikirate-url-builder';

@Component({
  selector: 'beyond-compliance',
  templateUrl: './beyond-compliance.component.html',
  styleUrls: ['./beyond-compliance.component.scss']
})
export class BeyondComplianceComponent implements OnInit {
  sector: string = "all-sectors";
  year: number | string = ''
  active: string = 'name';
  isLoading: boolean = true;
  beyond_compliance_metrics = beyond_compliance_metrics;
  metric_question:string = ''
  metric_seq = 1

  constructor(private dataProvider: DataProvider, private route: ActivatedRoute, private sectorProvider: SectorProvider, private chartService: ChartsService) {
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params: ParamMap) => {
      let sector = params.get('sector');
      if (sector !== null) {
        this.sector = sector
        this.updateData()
      }
      this.sectorProvider.getSector().next(sector);
    }
    )
    this.route.url.subscribe(val => {
      if (val[1].path === 'going-beyond-compliance')
        this.sectorProvider.getPath().next(val[1].path)
    })
  }

  getSectorName(): any {
    return (this.dataProvider.sectors as any)[this.sector]
  }

  updateData() {
    this.active = "name"
    this.isLoading = true;
    let company_group = this.dataProvider.getCompanyGroup(this.sector)

    const uk_statements_assessed = this.dataProvider.getAnswers(
      this.dataProvider.metrics.meet_uk_min_requirements, [
      new Filter("year", this.year),
      new Filter('value', ['Yes', 'No', 'Unknown']),
      new Filter("company_group", [company_group, this.dataProvider.companies_with_assessed_statement.uk].filter(value => value != ''))]
    )

    const aus_statements_assessed = this.dataProvider.getAnswers(
      this.dataProvider.metrics.meet_aus_min_requirements, [
      new Filter("year", this.year),
      new Filter('value', ['Yes', 'No', 'Unknown']),
      new Filter("company_group", [company_group, this.dataProvider.companies_with_assessed_statement.aus].filter(value => value != ''))]
    )

    const statements_assessed = this.dataProvider.getAnswers(
      this.dataProvider.metrics.msa_meet_min_requirements, [
      new Filter("year", this.year),
      new Filter('value', ['Yes', 'No', 'Unknown']),
      new Filter("company_group", [company_group, this.dataProvider.companies_with_assessed_statement.any].filter(value => value != ''))]
    )

    let metric:any = this.beyond_compliance_metrics.find((document: any) => document.seq === this.metric_seq)

    this.metric_question = metric['question']

    const metric_answers = this.dataProvider.getAnswers(metric['id'], [
      new Filter("year", this.year),
      new Filter("value", metric['filter_value']),
      new Filter("company_group", [company_group, this.dataProvider.companies_with_assessed_statement.any].filter(value => value != ''))
    ].filter(item => item.value != 'latest'))

    const metric_total_url = new WikirateUrlBuilder().setEndpoint(metric['id'])
      .addFilter(new Filter("year", this.year))
      .addFilter(new Filter("value", metric['filter_value']))
      .addFilter(new Filter("company_group", [company_group, this.dataProvider.companies_with_assessed_statement.any].filter(value => value != '')))
      .addFilter(new Filter('year', this.year))
      .build()

    const metric_uk_url = new WikirateUrlBuilder().setEndpoint(metric['id'])
      .addFilter(new Filter("year", this.year))
      .addFilter(new Filter("value", metric['filter_value']))
      .addFilter(new Filter("company_group", [company_group, this.dataProvider.companies_with_assessed_statement.uk].filter(value => value != '')))
      .addFilter(new Filter('year', this.year))
      .build()

    const metric_aus_url = new WikirateUrlBuilder().setEndpoint(metric['id'])
      .addFilter(new Filter("year", this.year))
      .addFilter(new Filter("value", metric['filter_value']))
      .addFilter(new Filter("company_group", [company_group, this.dataProvider.companies_with_assessed_statement.aus].filter(value => value != '')))
      .addFilter(new Filter('year', this.year))
      .build()

    forkJoin([uk_statements_assessed, aus_statements_assessed, statements_assessed, metric_answers])
      .pipe(map(([uk_assessed_statements, aus_assessed_statements, total_assessed_statements, answers]) => {
        if (this.year == 'latest') {
          total_assessed_statements = Object.values(total_assessed_statements.reduce((r: any, o: any) => {
            r[o.company] = (r[o.company] && r[o.company].year > o.year) ? r[o.company] : o
            return r
          }, {}))
        }

        let uk_count = answers.reduce((count: any, item:any) => {
          if (uk_assessed_statements.some((o: any) => o.company === item.company && o.year === item.year)) {
            return count + 1;
          }
          return count;
        }, 0);
        let aus_count = answers.reduce((count: any, item:any) => {
          if (aus_assessed_statements.some((o: any) => o.company === item.company && o.year === item.year)) {
            return count + 1;
          }
          return count;
        }, 0);
        let total = answers.reduce((count: any, item:any) => {
          if (total_assessed_statements.some((o: any) => o.company === item.company && o.year === item.year)) {
            return count + 1;
          }
          return count;
        }, 0);

        return {
          'uk_percent': Math.round(uk_count * 100 / uk_assessed_statements.length),
          'aus_percent': Math.round(aus_count * 100 / aus_assessed_statements.length),
          'total_percent': Math.round(total * 100 / total_assessed_statements.length)
        }
      }))
      .subscribe({
        next: (results) => {
          let vis_data = [
            { 'label': 'Both', 'value': results.total_percent, 'color': '#000029', 'metric': metric['label'], 'wikirate_page': metric_total_url },
            { 'label': 'UK', 'value': results.uk_percent, 'color': metric['uk_color_hex'], 'mandatory': metric['uk_color'] == 'bg-deep-orange' ? 'Yes' : 'No', 'metric': metric['label'], 'wikirate_page': metric_uk_url },
            { 'label': 'AUS', 'value': results.aus_percent, 'color': metric['aus_color_hex'], 'mandatory': metric['aus_color'] == 'bg-deep-orange' ? 'Yes' : 'No', 'metric': metric['label'], 'wikirate_page': metric_aus_url }]

          if (metric['label'] == "Consultation process") {
            vis_data = [
              { 'label': 'Both', 'value': NaN, 'color': '#000029', 'metric': metric['label'], 'wikirate_page': metric_total_url },
              { 'label': 'UK', 'value': NaN, 'color': metric['uk_color_hex'], 'mandatory': metric['uk_color'] == 'bg-deep-orange' ? 'Yes' : 'No', 'metric': metric['label'], 'wikirate_page': metric_uk_url },
              { 'label': 'AUS', 'value': results.aus_percent, 'color': metric['aus_color_hex'], 'mandatory': metric['aus_color'] == 'bg-deep-orange' ? 'Yes' : 'No', 'metric': metric['label'], 'wikirate_page': metric_aus_url }]
          }

          this.chartService.drawSimpleBarChart(metric['label'], '#metric-chart', vis_data, { renderer: "svg", actions: false })
        },
        complete: () => {
          this.isLoading = false
        }
      })
  }


  ngOnChanges(changes: SimpleChanges) {
    this.updateData()
  }
}
