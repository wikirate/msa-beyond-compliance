import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {DataProvider} from "../../../services/data.provider";
import {ChartsService} from "../../../services/charts.service";
// @ts-ignore
import risk_assessment from "../../../../assets/charts-params/risk-assessment.json";
// @ts-ignore
import risk_identification from "../../../../assets/charts-params/risk-identification.json";
import {Filter} from "../../../models/filter.model";


@Component({
  selector: 'approach-to-risks',
  templateUrl: './approach-to-risks.component.html',
  styleUrls: ['./approach-to-risks.component.scss']
})
export class ApproachToRisksComponent implements OnInit, OnChanges {
  isLoading: boolean = true;
  @Input()
  year!: number | string;
  @Input()
  sector !: string;
  @Input()
  legislation !: string;
  company_group: string[] = [];
  params = ''

  constructor(private dataProvider: DataProvider, private chartsService: ChartsService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.updateData()
  }

  ngOnInit(): void {
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

    this.chartsService.drawBarChart(
      "Risk Assessment",
      "div#risk-assessment-alt-two",
      350,
      200,
      assessed_statements_metric_id,
      risk_assessment,
      this.year,
      this.company_group,
      {renderer: "svg", actions: false}).finally(() => {
      this.chartsService.drawBarChart(
        "Risks identified by risk category",
        "div#risk-identification-alt-two",
        350,
        250,
        assessed_statements_metric_id,
        risk_identification,
        this.year,
        this.company_group,
        {
          renderer: "svg",
          actions: false
        }).finally(() => this.chartsService.drawSubgroupsBarChart(
        "Risks Management",
        "div#risk-management-alt-two",
        350,
        assessed_statements_metric_id,
        6948944,
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
            {"title": "On-site visits", "term": "On-site visits", "seq": 2},
            {"title": "Neither", "term": "Neither", "seq": 3}
          ],
          "transform": [{"type": "window", "ops": ["row_number"], "as": ["seq"]}]
        },
        this.year,
        this.company_group,
        {renderer: "svg", actions: false})).finally(() => this.isLoading = false
      )

    })
  }

}
