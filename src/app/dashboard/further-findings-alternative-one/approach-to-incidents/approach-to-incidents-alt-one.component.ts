import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {DataProvider} from "../../../services/data.provider";
import {ChartsService} from "../../../services/charts.service";
// @ts-ignore
import incidents_remediation from "../../../../assets/charts-params/incidents-remediation.json";
// @ts-ignore
import modern_slavery_training from "../../../../assets/charts-params/modern-slavery-training.json";
import {Filter} from "../../../models/filter.model";


@Component({
  selector: 'approach-to-incidents-alt-one',
  templateUrl: './approach-to-incidents.component.html',
  styleUrls: ['./approach-to-incidents.component.scss']
})
export class ApproachToIncidentsAltOneComponent implements OnInit, OnChanges {
  year: number | string = '';
  @Input()
  sector !: string;

  percentage_of_companies_identified_incidents: number = 0;
  isLoading: boolean = true;

  constructor(private dataProvider: DataProvider, private chartsService: ChartsService) {
  }

  ngOnInit(): void {

  }

  ngOnChanges(changes: SimpleChanges): void {
    this.updateData()
  }

  updateData() {
    let company_group = this.dataProvider.getCompanyGroup(this.sector)
    this.isLoading = true;
    this.dataProvider.getAnswers(this.dataProvider.metrics.aus_msa_statement_assessed,
      [new Filter("year", this.year), new Filter("value", "Yes"), new Filter("company_group", company_group)]).subscribe(aus_assessed => {
      this.dataProvider.getAnswers(this.dataProvider.metrics.uk_msa_statement_assessed,
        [new Filter("year", this.year), new Filter("value", "Yes"), new Filter("company_group", company_group)]).subscribe(uk_assessed => {
        // @ts-ignore
        let assessed = [...new Set([...aus_assessed, ...uk_assessed])];
        assessed = assessed.filter((arr, index, self) =>
          index === self.findIndex((t) => (t.company === arr.company && t.year === arr.year)))
        this.dataProvider.getAnswers(1831964,
          [new Filter("year", this.year), new Filter("value", "Yes"), new Filter("company_group", company_group)]).subscribe(reported_incidents => {
          // @ts-ignore
          reported_incidents = reported_incidents.filter((a: { company: any; year: any; }) => assessed.some(statement => statement.company == a.company && statement.year == a.year))
          this.percentage_of_companies_identified_incidents = Math.round(reported_incidents.length * 100 / assessed.length);
        }, error => {
          console.log(error)
        }, () => {
          this.chartsService.drawSubgroupsBarChart(
            "Whistleblowing or Grievance Mechanisms",
            "div#whistleblowing-mechanisms-alt-one",
            300,
            this.dataProvider.metrics.msa_statement_assessed,
            2722458,
            {
              "name": "subgroups",
              "values": [
                {
                  "key": "(direct employees)",
                  "label": "Direct employees",
                  "color": 0,
                  "seq": 1
                },
                {"key": "(supply chain workers)", "label": "Supply chain workers", "color": 1, "seq": 2},
                {"key": "", "label": "Direct employees", "color": 2, "seq": 3}
              ],
              "transform": [{"type": "window", "ops": ["row_number"], "as": ["seq"]}]
            },
            {
              "name": "groups",
              "values": [
                {
                  "title": "Whistleblower protection",
                  "term": "Whistleblower protection",
                  "seq": 1
                }, {
                  "title": "Hotline, Email, Contact Form",
                  "term": "Hotline",
                  "seq": 2
                }, {
                  "title": "Focal Point",
                  "term": "Focal Point",
                  "seq": 3
                },
                {"title": "None of the Above", "term": "No", "seq": 3}
              ],
              "transform": [{"type": "window", "ops": ["row_number"], "as": ["seq"]}]
            },
            this.year,
            company_group,
            {renderer: "svg", actions: {source: false, editor: true}}).finally(() => {
            this.chartsService.drawBarChart(
              "Incidents Remediation",
              "div#incident-remediation-alt-one",
              350,
              250,
              this.dataProvider.metrics.msa_statement_assessed,
              incidents_remediation,
              this.year,
              company_group,
              {renderer: "svg", actions: {source: false, editor: true}}).finally(() => {
              this.chartsService.drawBarChart(
                "Modern Slavery Training",
                "div#training-alt-one",
                350,
                350,
                this.dataProvider.metrics.msa_statement_assessed,
                modern_slavery_training,
                this.year,
                company_group,
                {renderer: "svg", actions: {source: false, editor: true}}).finally(() => {
                this.isLoading = false
              })
            })
          })
        })
      })
    })


  }

}
