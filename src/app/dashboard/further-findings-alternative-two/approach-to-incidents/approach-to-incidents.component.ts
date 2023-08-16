import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {DataProvider} from "../../../services/data.provider";
import {ChartsService} from "../../../services/charts.service";
// @ts-ignore
import incidents_remediation from "../../../../assets/charts-params/incidents-remediation.json";
// @ts-ignore
import modern_slavery_training from "../../../../assets/charts-params/modern-slavery-training.json";
import {Filter} from "../../../models/filter.model";


@Component({
  selector: 'approach-to-incidents',
  templateUrl: './approach-to-incidents.component.html',
  styleUrls: ['./approach-to-incidents.component.scss']
})
export class ApproachToIncidentsComponent implements OnInit, OnChanges {
  @Input()
  year!: number | string;
  @Input()
  sector !: string;
  @Input()
  legislation!: string;
  company_group: string[] = []
  params = ''

  isLoading: boolean = true;

  constructor(private dataProvider: DataProvider, private chartsService: ChartsService) {
  }

  ngOnInit(): void {

  }

  ngOnChanges(changes: SimpleChanges): void {
    this.updateData()
  }

  updateData() {
    this.company_group = []
    if (this.sector != 'all-sectors')
      this.company_group.push(this.dataProvider.getCompanyGroup(this.sector))
    this.isLoading = true;
    let assessed_statements_metric_id = this.dataProvider.metrics.msa_meet_min_requirements
    this.company_group.push(this.dataProvider.companies_with_assessed_statement.any)
    if (this.legislation == 'uk') {
      assessed_statements_metric_id = this.dataProvider.metrics.meet_uk_min_requirements
      this.company_group.push(this.dataProvider.companies_with_assessed_statement.uk)
    } else if (this.legislation == 'aus') {
      assessed_statements_metric_id = this.dataProvider.metrics.meet_aus_min_requirements
      this.company_group.push(this.dataProvider.companies_with_assessed_statement.aus)
    }

    this.params = DataProvider.getUrlParams([new Filter('year', this.year),
      new Filter("company_group", this.company_group),
    ].filter((filter) => filter.value != '' && filter.value != 'latest')).toString()

    this.chartsService.drawSubgroupsBarChart(
      "Whistleblowing or Grievance Mechanisms",
      "div#whistleblowing-mechanisms-alt-two",
      300,
      assessed_statements_metric_id,
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
            "title": "Hotline, email, contact form",
            "term": "Hotline",
            "seq": 2
          }, {
            "title": "Focal point",
            "term": "Focal Point",
            "seq": 3
          },
          {"title": "None of the above", "term": "No", "seq": 3}
        ],
        "transform": [{"type": "window", "ops": ["row_number"], "as": ["seq"]}]
      },
      this.year,
      this.company_group,
      {renderer: "svg", actions: false}).finally(() => {
      this.chartsService.drawBarChart(
        "Incidents Remediation",
        "div#incident-remediation-alt-two",
        350,
        250,
        assessed_statements_metric_id,
        incidents_remediation,
        this.year,
        this.company_group,
        {renderer: "svg", actions: false}).finally(() => {
        this.chartsService.drawBarChart(
          "Modern Slavery Training",
          "div#training-alt-two",
          350,
          350,
          assessed_statements_metric_id,
          modern_slavery_training,
          this.year,
          this.company_group,
          {renderer: "svg", actions: false}).finally(() => {
          this.isLoading = false
        })
      })
    })
  }

}
