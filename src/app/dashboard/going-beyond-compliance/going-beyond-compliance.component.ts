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
  garment_avg_disclosure_rate: number = 0;
  financial_avg_disclosure_rate: number = 0;
  hospitality_avg_disclosure_rate: number = 0;

  constructor(private dataProvider: DataProvider, private route: ActivatedRoute, private sectorProvider: SectorProvider) {
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params: ParamMap) => {
        let sector = params.get('sector');
        if (sector !== null) {
          this.sector = sector
          this.updateBeyondComplianceTable()
        }
        this.sectorProvider.getSector().next(sector);
      }
    )
    this.route.url.subscribe(val => {
      if (val[1].path === 'going-beyond-compliance')
        this.sectorProvider.getPath().next(val[1].path)
    })
  }

  updateBeyondComplianceTable() {
    this.active = "name"
    this.beyond_compliance_table_data = []
    this.isLoading = true;
    let company_group = this.dataProvider.getCompanyGroup(this.sector)
    this.dataProvider.getAnswers(
      this.dataProvider.metrics.uk_msa_statement_assessed, [
        new Filter("year", this.year),
        new Filter('value', ['Yes']),
        new Filter("company_group", company_group)
      ]
    ).subscribe(uk_assessed => {
      let uk_msa_statements_assessed = uk_assessed.map((a: { [x: string]: any; }) => {
        return {company: a['company'], year: a['year']}
      })
      this.dataProvider.getAnswers(
        this.dataProvider.metrics.aus_msa_statement_assessed, [new Filter("year", this.year), new Filter('value', ['Yes']),
          new Filter("company_group", company_group)]
      ).subscribe(aus_assessed => {
        let aus_msa_statements_assessed: any[] = aus_assessed.map((a: { [x: string]: any; }) => {
          return {company: a['company'], year: a['year']}
        })
        let total_assessed = [...new Set([...uk_msa_statements_assessed, ...aus_msa_statements_assessed])];
        total_assessed = total_assessed.filter((arr, index, self) =>
          index === self.findIndex((t) => (t.company === arr.company && t.year === arr.year)))

        var observables = beyond_compliance_metrics.map((metric: any) => {
          return this.dataProvider.getAnswers(metric['id'], [new Filter("year", this.year), new Filter("value", metric['filter_value'])])
        })

        forkJoin(observables).subscribe(results => {
          // @ts-ignore
          results.forEach((answers, index) => {
            let metric = beyond_compliance_metrics[index]
            let uk_count = 0;
            let aus_count = 0;
            let total = 0;
            for (let answer of answers) {
              let c1 = uk_msa_statements_assessed.find((i: { company: any; year: any; }) => {
                return i['company'] == answer['company'] && i['year'] == answer['year']
              }) !== undefined;
              let c2 = aus_msa_statements_assessed.find((i: { company: any; year: any; }) => {
                return i['company'] == answer['company'] && i['year'] == answer['year']
              }) !== undefined;
              if (c1) uk_count++;
              if (c2) aus_count++;
              if (c1 || c2) total++;

            }
            let uk_percent = Math.round(uk_count * 100 / uk_msa_statements_assessed.length)
            let aus_percent = Math.round(aus_count * 100 / aus_msa_statements_assessed.length)
            let total_percent = Math.round(total * 100 / total_assessed.length)
            let filter_value = ''
            for (let value of metric['filter_value']) {
              filter_value += 'filter[value][]=' + value + '&'
            }
            if (metric['label'] == "Consultation process") {
              this.beyond_compliance_table_data.push({
                'name': metric['label'],
                'url': 'https://wikirate.org/' + metric['metric'] + '?filter[year]=' + this.year + '&' + filter_value.substring(0, filter_value.length + 1),
                'uk': "N/A",
                'aus': aus_percent,
                'total': "N/A",
                'aus_color': metric['aus_color'],
                'uk_color': metric['uk_color']
              })
            } else {
              this.beyond_compliance_table_data.push({
                'name': metric['label'],
                'url': 'https://wikirate.org/' + metric['metric'] + '?filter[year]=' + this.year + '&' + filter_value.substring(0, filter_value.length + 1),
                'uk': uk_percent,
                'aus': aus_percent,
                'total': total_percent,
                'aus_color': metric['aus_color'],
                'uk_color': metric['uk_color']
              })
            }
          })
        }, (error) => console.log(error), () => {
          this.sort('total');
          this.isLoading = false;
        })
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
    this.updateBeyondComplianceTable()
  }
}
