import { Component, OnInit } from '@angular/core';
// @ts-ignore
import beyond_compliance_metrics from "../../../assets/charts-params/beyond-compliance-metrics.json"
import { DataProvider } from 'src/app/services/data.provider';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { SectorProvider } from 'src/app/services/sector.provider';
import { ChartsService } from 'src/app/services/charts.service';
import { Filter } from 'src/app/models/filter.model';
import { forkJoin, map, Observable } from "rxjs";

@Component({
  selector: 'app-going-beyond-compliance',
  templateUrl: './going-beyond-compliance.component.html',
  styleUrls: ['./going-beyond-compliance.component.scss']
})
export class GoingBeyondComplianceComponent implements OnInit {
  getSectorName(): any {
    return (this.dataProvider.sectors as any)[this.sector]
  }
  
  sector: string = "all-sectors";
  year: number | string = ''
  beyond_compliance_metrics = beyond_compliance_metrics;
  metric_question = ''
  metric_seq = 1
  isLoading = true;

  constructor(private dataProvider: DataProvider, private route: ActivatedRoute,
    private sectorProvider: SectorProvider, private chartService: ChartsService) {
  }


  ngOnInit(): void {
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

  updateData() {
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

    let requests: Observable<any>[] = [];
    requests.push(uk_statements_assessed)
    requests.push(aus_statements_assessed)
    requests.push(statements_assessed)

    for (let metric of beyond_compliance_metrics) {
      requests.push(
        this.dataProvider.getAnswers(metric['id'], [
          new Filter("year", this.year),
          new Filter("value", metric['filter_value']),
          new Filter("company_group", [company_group, this.dataProvider.companies_with_assessed_statement.any].filter(value => value !== ''))
        ].filter(item => item.value !== 'latest'))
      );
    }

    forkJoin(requests)
      .pipe(map((responses: any) => {
        let results: any = []
        if (this.year == 'latest') {
          responses[2] = Object.values(responses[2].reduce((r: any, o: any) => {
            r[o.company] = (r[o.company] && r[o.company].year > o.year) ? r[o.company] : o
            return r
          }, {}))
        }

        for (let i = 3; i < responses.length; i++) {
          let uk_count = responses[i].reduce((count: any, item: any) => {
            if (responses[0].some((o: any) => o.company === item.company && o.year === item.year)) {
              return count + 1;
            }
            return count;
          }, 0);
          let aus_count = responses[i].reduce((count: any, item: any) => {
            if (responses[1].some((o: any) => o.company === item.company && o.year === item.year)) {
              return count + 1;
            }
            return count;
          }, 0);
          let total = responses[i].reduce((count: any, item: any) => {
            if (responses[2].some((o: any) => o.company === item.company && o.year === item.year)) {
              return count + 1;
            }
            return count;
          }, 0);

          results.push({
            'key': beyond_compliance_metrics[i - 3]['label'],
            'value': Math.round(uk_count * 100 / responses[0].length),
            'category': 'UK',
            'label': beyond_compliance_metrics[i - 3]['break_down_label'],
            'question': beyond_compliance_metrics[i - 3]['question'],
            'mandatory': beyond_compliance_metrics[i - 3]['aus_color'] == 'bg-deep-orange' ? 'Yes' : 'No'
          })

          results.push({
            'key': beyond_compliance_metrics[i - 3]['label'],
            'value': Math.round(aus_count * 100 / responses[1].length),
            'category': 'AUS',
            'label': beyond_compliance_metrics[i - 3]['break_down_label'],
            'question': beyond_compliance_metrics[i - 3]['question'],
            'mandatory': beyond_compliance_metrics[i - 3]['aus_color'] == 'bg-deep-orange' ? 'Yes' : 'No'
          })

          results.push({
            'key': beyond_compliance_metrics[i - 3]['label'],
            'value': Math.round(total * 100 / responses[2].length),
            'category': 'Both',
            'label': beyond_compliance_metrics[i - 3]['break_down_label'],
            'question': beyond_compliance_metrics[i - 3]['question'],
            'mandatory': beyond_compliance_metrics[i - 3]['aus_color'] == 'bg-deep-orange' ? 'Yes' : 'No'
          })
        }
        return results
      }))
      .subscribe({
        next: (results) => {
          this.chartService.drawRadarChart('', '#radar-chart', results, '', { renderer: "svg", actions: true })
        },
        complete: () => {
          this.isLoading = false
        }
      })
  }
}