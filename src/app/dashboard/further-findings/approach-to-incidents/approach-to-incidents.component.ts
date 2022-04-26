import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {DataProvider} from "../../../services/data.provider";
import {ChartsService} from "../../../services/charts.service";
// @ts-ignore
import incidents_remediation from "../../../../assets/charts-params/incidents-remediation.json";

@Component({
  selector: 'approach-to-incidents',
  templateUrl: './approach-to-incidents.component.html',
  styleUrls: ['./approach-to-incidents.component.scss']
})
export class ApproachToIncidentsComponent implements OnInit, OnChanges {
  @Input()
  year!: number | string;

  isLoading: boolean = true;

  constructor(private dataProvider: DataProvider, private chartsService: ChartsService) {
  }

  ngOnInit(): void {

  }

  ngOnChanges(changes: SimpleChanges): void {
    this.updateData()
  }

  updateData() {
    this.chartsService.drawSubgroupsBarChart(
      "Whistleblowing or Grievance Mechanisms",
      "div#whistleblowing-mechanisms",
      400,
      320,
      [this.dataProvider.metrics.uk_msa_statement_assessed, this.dataProvider.metrics.aus_msa_statement_assessed],
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
          {"key": "(supply chain workers)", "label": "Supply chain workers", "color": 1, "seq": 2}
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
          },{
            "title": "Hotline, Email, Contact Form",
            "term": "Hotline",
            "seq": 2
          },{
            "title": "Focal Point",
            "term": "Focal Point",
            "seq": 3
          },
          {"title": "In Development", "term": "In Development", "seq": 4}
        ],
        "transform": [{"type": "window", "ops": ["row_number"], "as": ["seq"]}]
      },
      this.year,
      {renderer: "svg", actions: {source: false, editor: true}}).finally(() => {
      this.chartsService.drawBarChart(
        "Incidents Remediation",
        "div#incident-remediation",
        400,
        250,
        [this.dataProvider.metrics.uk_msa_statement_assessed, this.dataProvider.metrics.aus_msa_statement_assessed],
        incidents_remediation,
        this.year,
        {renderer: "svg", actions: {source: false, editor: true}}).finally(() => this.isLoading = false)
    })
  }

}
