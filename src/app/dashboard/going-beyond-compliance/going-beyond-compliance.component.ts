import {Component, OnInit} from '@angular/core';
import {DataProvider} from "../../services/data.provider";
import {Filter} from "../../models/filter.model";
// @ts-ignore
import beyond_compliance_metrics from "../../../assets/charts-params/beyond-compliance-metrics.json"
import {delay} from "rxjs";

@Component({
  selector: 'going-beyond-compliance',
  templateUrl: './going-beyond-compliance.component.html',
  styleUrls: ['./going-beyond-compliance.component.scss']
})
export class GoingBeyondComplianceComponent implements OnInit {
  year: number | string = ''
  beyond_compliance_table_data: any[] = []
  active: string = 'name';
  isLoading: boolean = true;

  constructor(private dataProvider: DataProvider) {
  }

  ngOnInit(): void {
    this.updateData()
  }

  updateData() {
    this.active = "name"
    this.beyond_compliance_table_data = []
    this.isLoading = true;
    this.dataProvider.getAnswers(
      this.dataProvider.metrics.uk_msa_statement_assessed, [new Filter("year", this.year), new Filter('value', 'Yes')]
    ).subscribe(uk_assessed => {
      let uk_msa_statements_assessed = uk_assessed.map((a: { [x: string]: any; }) => {
        return {company: a['company'], year: a['year']}
      })
      this.dataProvider.getAnswers(
        this.dataProvider.metrics.aus_msa_statement_assessed, [new Filter("year", this.year), new Filter('value', 'Yes')]
      ).subscribe(aus_assessed => {
        let aus_msa_statements_assessed: any[] = aus_assessed.map((a: { [x: string]: any; }) => {
          return {company: a['company'], year: a['year']}
        })
        let total_assessed = [...new Set([...uk_msa_statements_assessed, ...aus_msa_statements_assessed])];
        for (let metric of beyond_compliance_metrics) {
          this.dataProvider.getAnswers(metric['id'], [new Filter("year", this.year), new Filter("value", metric['filter_value'])])
            .subscribe(answers => {
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
              this.beyond_compliance_table_data.push({
                'name': metric['label'],
                'url': 'https://wikirate.org/' + metric['metric'] + '?filter[year]=' + this.year + '&' + filter_value.substring(0, filter_value.length + 1),
                'uk': uk_percent,
                'aus': aus_percent,
                'total': total_percent,
                'aus_color': metric['aus_color'],
                'uk_color': metric['uk_color']
              })
            }, (error) => console.log(error), () => {
              this.sort('total');
              this.isLoading = false
            })
        }
      })
    })
  }

  sort(column: string) {
    this.beyond_compliance_table_data.sort((a, b) => a[column] > b[column] ? -1 : 0)
    this.active = column

  }

  openURL(url: string) {
    window.open(url, "_blank")
  }
}
