import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Filter } from 'src/app/models/filter.model';
import { ChartsService } from 'src/app/services/charts.service';
import { DataProvider } from 'src/app/services/data.provider';
import { SectorProvider } from 'src/app/services/sector.provider';
import { forkJoin, map } from 'rxjs';

@Component({
  selector: 'highlight-metric',
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
  companies_reporting_msi!: number
  sample_size!: number;

  constructor(private dataProvider: DataProvider, private modalService: NgbModal,
    private route: ActivatedRoute, private sectorProvider: SectorProvider, private chartsService: ChartsService) {

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

  getCategory(text: string){
    switch (text) {
      case "Yes":
        return "Modern slavery";
      case "Working Hours":
        return "Excessive hours"
      default: 
        return text;
    }
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
    this.isLoading = true;

    var accepted_values = ["Yes", "Recruitment fees", "Freedom of movement", "Wages and benefits", "Working Hours", "Working conditions", "Other incidents"]
    let assessed_filters = [
      new Filter("year", this.year),
      new Filter("value", accepted_values),
      new Filter("company_group", this.company_group)
    ]
    if (this.year == 'latest') {
      assessed_filters = [
        new Filter("value", accepted_values),
        new Filter("company_group", this.company_group)
      ]
    }
    const assessed = this.dataProvider.getAnswers(assessed_statements_metric, assessed_filters)

    const msa_incidents = this.dataProvider.getAnswers(incidents_identified_metric,
      [
        new Filter("year", this.year),
        new Filter("value", accepted_values),
        new Filter("company_group", this.company_group)
      ])


    const descriptions: any = {
      "Yes": "Cases that companies have self-reported finding \"Modern slavery\" or specifically noted finding forced or child labour",
      "Recruitment fees": "Cases of workers paying recruitment or other fees",
      "Freedom of movement": "Restrictions on freedom of movement workers (e.g. withholding of passports)",
      "Wages and benefits": "Issues related to wages (underpayment, salary below minimum wages)",
      "Working Hours": "Cases of excessive or mandatory overtime",
      "Working conditions": "Issues related to health and safety or cases of harassment",
      "Other incidents": "Cases of illegal subcontracting or issues related to general labour practices"
    }

    forkJoin([assessed, msa_incidents])
      .pipe(map(([assessed_response, msa_incidents_response]) => {
        if (this.year == 'latest') {
          assessed_response = Object.values(assessed_response.reduce((r: any, o: any) => {
            r[o.company] = (r[o.company] && r[o.company].year > o.year) ? r[o.company] : o

            return r
          }, {}))
        }
        msa_incidents_response = msa_incidents_response.filter((item: any) => assessed_response.find((o: any) => o.company == item.company && o.year == item.year))

        var values: any[] = []
        this.companies_reporting_msi = Math.round((msa_incidents_response.length) * 100 / assessed_response.length)
        values.push({
          "category": "Companies reporting\nmodern slavery\nincidents",
          "stack": 1,
          "sort": 1,
          "labels": "left",
          "labeledValue": this.companies_reporting_msi
        })

        var data: any = {
          "Yes": 0,
          "Recruitment fees": 0,
          "Freedom of movement": 0,
          "Wages and benefits": 0,
          "Working Hours": 0,
          "Working conditions": 0,
          "Other incidents": 0
        }

        for (var i = 0; i < msa_incidents_response.length; i++) {
          var options = msa_incidents_response[i]['value'].split(", ")
          for (var option of options) {
            data[option] = data[option] + 1
          }
        }
        let sortedData = Object.fromEntries(Object.entries(data)
          .filter(([key, value]) => value !== 0)
          .sort((a: any, b: any) => a[1] - b[1]));

        i = 0
        for (const key in sortedData) {
          values.push({
            "category": this.getCategory(key),
            "stack": 2,
            "sort": i + 1,
            "labels": "right",
            "gap": 0
          })
          i++;
        }

        for (const key in sortedData) {
          values.push({
            'source': "Companies reporting\nmodern slavery\nincidents",
            'destination': this.getCategory(key),
            'description': descriptions[key],
            'value': Math.round(data[key] * 100 / msa_incidents_response.length)
          })
        }
        this.sample_size = assessed_response.length

        return {
          'incidents': Math.round((msa_incidents_response.length) * 100 / assessed_response.length),
          'values': values
        }
      }))
      .subscribe({
        next: (results) => {
          this.incidents = results.incidents

          this.chartsService.drawShankeyChart(
            '#incidents-chart',
            results.values,
            {
              renderer: "svg",
              actions: false
            }
          )
        },
        complete: () => {
          this.isLoading = false
        }
      })
  }

  openMessage() {
    this.modalService.open(this.content, { centered: true });
  }
}
