import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Filter } from 'src/app/models/filter.model';
import { ChartsService } from 'src/app/services/charts.service';
import { DataProvider } from 'src/app/services/data.provider';
import { SectorProvider } from 'src/app/services/sector.provider';
import { Meta, Title } from "@angular/platform-browser";
import { ValueRange } from 'src/app/models/valuerange.model';
import { forkJoin, map } from 'rxjs';

@Component({
  selector: 'app-highlight-metric',
  templateUrl: './highlight-metric.component.html',
  styleUrls: ['./highlight-metric.component.scss']
})
export class HighlightMetricComponent implements OnInit {
  sector: string = "all-sectors";
  @ViewChild("content") content!: TemplateRef<any>;
  company_group: string[] = []
  incidents!: number;
  isLoading: boolean = false;
  year: string = ''
  legislation: string = 'both'
  incidents_url: string = "#"

  constructor(private dataProvider: DataProvider, private modalService: NgbModal,
    private route: ActivatedRoute, private sectorProvider: SectorProvider, private chartsService: ChartsService,
    private titleService: Title, private meta: Meta) {

  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params: ParamMap) => {
      let sector = params.get('sector');
      if (sector !== null) {
        this.sector = sector
        this.updateData(this.year)
      }
      this.sectorProvider.getSector().next(sector);
    }
    )
  }

  getSectorName(): any {
    return (this.dataProvider.sectors as any)[this.sector]
  }

  updateData($event: any) {
    this.isLoading = true;

    this.company_group = []
    if (this.sector != 'all-sectors')
      this.company_group.push(this.dataProvider.getCompanyGroup(this.sector))
    if (this.legislation === 'uk') {
      this.company_group.push(this.dataProvider.companies_with_assessed_statement.uk)
    } else if (this.legislation === 'aus') {
      this.company_group.push(this.dataProvider.companies_with_assessed_statement.aus)
    } else {
      this.company_group.push(this.dataProvider.companies_with_assessed_statement.any)
    }

    if (this.legislation === 'both') {
      this.createChart(this.dataProvider.metrics.msa_statement_assessed,
        this.dataProvider.metrics.msa_incidents_identified
      )
      return $event;
    }
    else if (this.legislation === 'uk') {
      this.createChart(this.dataProvider.metrics.uk_msa_statement_assessed,
        this.dataProvider.metrics.msa_incidents_identified
      )
      return $event;
    }
    else {
      if (this.year !== '' && this.year !== 'latest' && Number(this.year) < 2020) {
        this.openMessage();
        this.year = '2020';
      }
      this.createChart(this.dataProvider.metrics.aus_msa_statement_assessed,
        this.dataProvider.metrics.msa_incidents_identified
      )
      return this.year;
    }
  }

  createChart(assessed_statements_metric: number, incidents_identified_metric: number) {
    //prepare all requests that need to be executed

    let assessed_filters = [
      new Filter("year", this.year),
      new Filter("value", ["Yes"]),
      new Filter("company_group", this.company_group)
    ]
    if (this.year == 'latest') {
      assessed_filters = [
        new Filter("value", ["Yes"]),
        new Filter("company_group", this.company_group)
      ]
    }
    const assessed = this.dataProvider.getAnswers(assessed_statements_metric, assessed_filters)

    const msa_incidents = this.dataProvider.getAnswers(incidents_identified_metric,
      [
        new Filter("year", this.year),
        new Filter("value", ['Yes']),
        new Filter("company_group", this.company_group)
      ])

      /**perform the requests using forkJoin to get all the results before start calculating the key findings**/
    forkJoin([assessed, msa_incidents])
    .pipe(map(([assessed_response, msa_incidents_response]) => {
      if (this.year == 'latest') {
        assessed_response = Object.values(assessed_response.reduce((r: any, o: any) => {
          r[o.company] = (r[o.company] && r[o.company].year > o.year) ? r[o.company] : o

          return r
        }, {}))
      }
      msa_incidents_response = msa_incidents_response.filter((item: any) => assessed_response.find((o: any) => o.company == item.company && o.year == item.year))

      return {
        'incidents': Math.round((msa_incidents_response.length) * 100 / assessed_response.length),
      }
    }))
    .subscribe({next: (results) => {
      this.incidents = results.incidents

      this.drawDonutChart(this.incidents, "donut-incidents", this.incidents_url, "#FFCB2B")

      //loading stops when all requests and calculations have been performed successfully
    }, 
  complete: () => {
    this.isLoading = false
  }})
  }

  openMessage() {
    this.modalService.open(this.content, { centered: true });
  }

  drawDonutChart(percentage: number, elementId: string, url: string, hex: string) {
    this.chartsService.drawDonutChart(
      `${percentage}%`,
      `div#${elementId}`,
      [{
        'id': 'Incident(s) disclosed',
        'percent': percentage,
        'URL': url
      },
      {
        'id': 'No Incidents Disclosed',
        'percent': 100 - percentage,
        'URL': url
      }],
      250, 250, [hex, "#e5e5ea"],
      ["Incident(s) disclosed", "No Incidents Disclosed"], { renderer: "svg", actions: false })
  }

}
