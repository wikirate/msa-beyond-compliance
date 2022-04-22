import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {DataProvider} from "../../../services/data.provider";
import {ChartsService} from "../../../services/charts.service";
// @ts-ignore
import risk_assessment from "../../../../assets/charts-params/risk-assessment.json";
// @ts-ignore
import risk_identification from "../../../../assets/charts-params/risk-identification.json";


@Component({
  selector: 'approach-to-risks',
  templateUrl: './approach-to-risks.component.html',
  styleUrls: ['./approach-to-risks.component.scss']
})
export class ApproachToRisksComponent implements OnInit, OnChanges {
  isLoading: boolean = true;
  @Input()
  year!: number | string;

  constructor(private dataProvider: DataProvider, private chartsService: ChartsService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.updateData()
  }

  ngOnInit(): void {
  }

  updateData() {
    this.isLoading = true;
    this.chartsService.drawBarChart(
      "Risk Assessment",
      "div#risk-assessment",
      400,
      200,
      [this.dataProvider.metrics.uk_msa_statement_assessed, this.dataProvider.metrics.aus_msa_statement_assessed],
      risk_assessment,
      this.year,
      {renderer: "svg", actions: {source: false, editor: true}}).finally(() => {
      this.chartsService.drawBarChart(
        "Risks identified by risk category",
        "div#risk-identification",
        400,
        250,
        [this.dataProvider.metrics.uk_msa_statement_assessed, this.dataProvider.metrics.aus_msa_statement_assessed],
        risk_identification,
        this.year,
        {
          renderer: "svg",
          actions: {source: false, editor: true}
        }).finally(() => this.chartsService.drawSubgroupsBarChart(
        "Risks Management",
        "div#risk-management",
        400,
        200,
        [this.dataProvider.metrics.uk_msa_statement_assessed, this.dataProvider.metrics.aus_msa_statement_assessed],
        2722169,
        {
          "name": "subgroups",
          "values": [
            {
              "key": "(self- reporting)",
              "label": "Self reporting",
              "color": 0,
              "seq": 1
            },
            {"key": "(independent)", "label": "Independent", "color": 1, "seq": 2}
          ],
          "transform": [{"type": "window", "ops": ["row_number"], "as": ["seq"]}]
        },
        {
          "name": "groups",
          "values": [
            {
              "title": "Audits of suppliers",
              "term": "Audits of suppliers",
              "seq": 1
            },
            {"title": "On-site visits", "term": "On-site visits", "seq": 2}
          ],
          "transform": [{"type": "window", "ops": ["row_number"], "as": ["seq"]}]
        },
        this.year,
        {renderer: "svg", actions: {source: false, editor: true}})).finally(() => this.isLoading = false)
    })
  }

}
