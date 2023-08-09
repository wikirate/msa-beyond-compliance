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

  constructor(private dataProvider: DataProvider, private route: ActivatedRoute, private sectorProvider: SectorProvider) {
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
      this.dataProvider.metrics.uk_msa_statement_assessed, [
        new Filter("year", this.year),
        new Filter('value', ['Yes']),
        new Filter("company_group", company_group)
      ]
    )

    const aus_statements_assessed = this.dataProvider.getAnswers(
      this.dataProvider.metrics.aus_msa_statement_assessed, [new Filter("year", this.year), new Filter('value', ['Yes']),
        new Filter("company_group", company_group)]
    )

    const statements_assessed = this.dataProvider.getAnswers(
      this.dataProvider.metrics.msa_statement_assessed, [new Filter("year", this.year), new Filter('value', ['Yes']),
        new Filter("company_group", company_group)]
    )

    forkJoin([uk_statements_assessed, aus_statements_assessed, statements_assessed]).subscribe(assessed_statements => {
      let uk_assessed_statements = assessed_statements[0]
      let aus_assessed_statements = assessed_statements[1]
      let total_assessed_statements = assessed_statements[2]

      var metric_answers = beyond_compliance_metrics.map((metric: any) => {
        return this.dataProvider.getAnswers(metric['id'], [new Filter("year", this.year), new Filter("value", metric['filter_value'])])
      })

      forkJoin(metric_answers).subscribe(results => {
        // @ts-ignore
        results.forEach((answers, index) => {
          let metric = beyond_compliance_metrics[index]
          let uk_count = 0;
          let aus_count = 0;
          let total = 0;
          for (let answer of answers) {
            let c1 = uk_assessed_statements.find((i: { company: any; year: any; }) => {
              return i['company'] == answer['company'] && i['year'] == answer['year']
            }) !== undefined;
            let c2 = aus_assessed_statements.find((i: { company: any; year: any; }) => {
              return i['company'] == answer['company'] && i['year'] == answer['year']
            }) !== undefined;
            if (c1) uk_count++;
            if (c2) aus_count++;
            if (c1 || c2) total++;
          }

          let uk_percent = Math.round(uk_count * 100 / uk_assessed_statements.length)
          let aus_percent = Math.round(aus_count * 100 / aus_assessed_statements.length)
          let total_percent = Math.round(total * 100 / total_assessed_statements.length)
          let filter_value = ''
          for (let value of metric['filter_value']) {
            filter_value += 'filter[value][]=' + value + '&'
          }
          if (metric['label'] == "Consultation process") {
            this.beyond_compliance_table_data.push({
              'name': metric['label'],
              'url': 'https://wikirate.org/' + metric['metric'] + '?filter[year]=' + this.year + '&filter[company_group]=' + company_group + '&' + filter_value.substring(0, filter_value.length + 1),
              'uk': "N/A",
              'aus': aus_percent,
              'total': "N/A",
              'aus_color': metric['aus_color'],
              'uk_color': metric['uk_color']
            })
          } else {
            this.beyond_compliance_table_data.push({
              'name': metric['label'],
              'url': 'https://wikirate.org/' + metric['metric'] + '?filter[year]=' + this.year + '&filter[company_group]=' + company_group + '&' + filter_value.substring(0, filter_value.length + 1),
              'uk': uk_percent,
              'aus': aus_percent,
              'total': total_percent,
              'aus_color': metric['aus_color'],
              'uk_color': metric['uk_color']
            })
          }
        })

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
