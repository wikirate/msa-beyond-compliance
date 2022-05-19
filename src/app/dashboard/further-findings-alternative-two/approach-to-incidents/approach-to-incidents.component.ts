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
    this.chartsService.drawSubgroupsBarChart(
      "Whistleblowing or Grievance Mechanisms",
      "div#whistleblowing-mechanisms-alt-two",
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
      {renderer: "svg", actions: false}).finally(() => {
      this.chartsService.drawBarChart(
        "Incidents Remediation",
        "div#incident-remediation-alt-two",
        350,
        250,
        this.dataProvider.metrics.msa_statement_assessed,
        incidents_remediation,
        this.year,
        company_group,
        {renderer: "svg", actions: false}).finally(() => {
        this.chartsService.drawBarChart(
          "Modern Slavery Training",
          "div#training-alt-two",
          350,
          350,
          this.dataProvider.metrics.msa_statement_assessed,
          modern_slavery_training,
          this.year,
          company_group,
          {renderer: "svg", actions: false}).finally(() => {
          this.isLoading = false
        })
      })
    })
  }

}
