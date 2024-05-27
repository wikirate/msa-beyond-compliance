import {Component, OnInit, SimpleChanges} from '@angular/core';
import {DataProvider} from "../../services/data.provider";
import {Filter} from "../../models/filter.model";
// @ts-ignore
import beyond_compliance_metrics from "../../../assets/charts-params/beyond-compliance-metrics.json"
import {ActivatedRoute, ParamMap} from "@angular/router";
import {SectorProvider} from "../../services/sector.provider";
import {forkJoin, from, mergeMap, Observable, toArray} from "rxjs";
import {error} from "vega";
import {ValueRange} from 'src/app/models/valuerange.model';
import { ChartsService } from 'src/app/services/charts.service';

@Component({
  selector: 'going-beyond-compliance',
  templateUrl: './going-beyond-compliance.component.html',
  styleUrls: ['./going-beyond-compliance.component.scss']
})
export class GoingBeyondComplianceComponent implements OnInit {
  sector: string = "all-sectors";
  year: number | string = ''
  beyond_compliance_table_data: any[] = []
  active: string = 'name';
  isLoading: boolean = true;

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
    this.beyond_compliance_table_data = []
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

    forkJoin([uk_statements_assessed, aus_statements_assessed, statements_assessed]).subscribe(assessed_statements => {
      let uk_assessed_statements = assessed_statements[0]
      let aus_assessed_statements = assessed_statements[1]
      let total_assessed_statements = assessed_statements[2]

      var metric_answers = beyond_compliance_metrics.map((metric: any) => {
        return this.dataProvider.getAnswers(metric['id'], [
          new Filter("year", this.year),
          new Filter("value", metric['filter_value']),
          new Filter("company_group", [company_group, this.dataProvider.companies_with_assessed_statement.any].filter(value => value != ''))
        ].filter(item => item.value != 'latest'))
      })

      forkJoin(metric_answers).subscribe(results => {
        // @ts-ignore
        results.forEach((answers, index) => {
          let metric = beyond_compliance_metrics[index]
          let uk_count = 0;
          let aus_count = 0;
          let total = 0;

          for (let answer of answers) {
            let found = false;
            uk_assessed_statements.find((item: any) => {
              if (item['company'] == answer['company'] && item['year'] == answer['year']) {
                uk_count++;
                found = true;
              }
            })
            aus_assessed_statements.find((item: any) => {
              if (item['company'] == answer['company'] && item['year'] == answer['year']) {
                aus_count++;
                found = true;
              }
            })
            if (found) total++;
          }
          let uk_percent = Math.round(uk_count * 100 / uk_assessed_statements.length)
          let aus_percent = Math.round(aus_count * 100 / aus_assessed_statements.length)
          let total_percent = Math.round(total * 100 / total_assessed_statements.length)

          let filters: Filter[] = [new Filter('year', this.year),
            new Filter("company_group", [company_group]),
            new Filter("value", metric['filter_value'])
          ].filter((filter) => filter.value != '' && filter.value != 'latest')

          let params = DataProvider.getUrlParams(filters)

          if (metric['label'] == "Consultation process") {
            this.beyond_compliance_table_data.push({
              'group': metric['label'],
              'url': 'https://wikirate.org/' + metric['metric'] + '?' + params.toString(),
              'category':'UK',
              'value': 'N/A',
              'color': '#FF5C45',
              'mandatory': metric['uk_color'] == 'bg-deep-orange' ? 'Yes' : 'No'
            })
            this.beyond_compliance_table_data.push({
              'group': metric['label'],
              'url': 'https://wikirate.org/' + metric['metric'] + '?' + params.toString(),
              'category':'Australian',
              'value':aus_percent,
              'color': '#000029',
              'mandatory': metric['aus_color'] == 'bg-deep-orange' ? 'Yes' : 'No'
            })
            this.beyond_compliance_table_data.push({
              'group': metric['label'],
              'url': 'https://wikirate.org/' + metric['metric'] + '?' + params.toString(),
              'category':'Both',
              'value':'N/A',
              'color':'#DDDDE3'
            })
          } else {
            this.beyond_compliance_table_data.push({
              'group': metric['label'],
              'url': 'https://wikirate.org/' + metric['metric'] + '?' + params.toString(),
              'category':'UK',
              'value': uk_percent,
              'color': '#FF5C45',
              'mandatory': metric['uk_color'] == 'bg-deep-orange' ? 'Yes' : 'No'
            })
            this.beyond_compliance_table_data.push({
              'group': metric['label'],
              'url': 'https://wikirate.org/' + metric['metric'] + '?' + params.toString(),
              'category':'Australian',
              'value':aus_percent,
              'color': '#000029',
              'mandatory': metric['aus_color'] == 'bg-deep-orange' ? 'Yes' : 'No'
            })
            this.beyond_compliance_table_data.push({
              'group': metric['label'],
              'url': 'https://wikirate.org/' + metric['metric'] + '?' + params.toString(),
              'category':'Both',
              'value':total_percent,
              'color':'#DDDDE3'
            })
          }
        })

        this.chartService.drawGroupedBarChart("#going-beyond-compliance-chart", this.beyond_compliance_table_data, { renderer: "svg", actions: false })
        this.isLoading = false
      })
    })
  }

  sort(column: string) {
    this.beyond_compliance_table_data.sort((a, b) => {
      if (b[column] == "N/A") return -1
      return a[column] > b[column] ? -1 : 1
    })
    this.active = column

  }

  openURL(url: string) {
    window.open(url, "_blank")
  }

  ngOnChanges(changes: SimpleChanges) {
    this.updateData()
  }
}
