import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {DataProvider} from "../../../services/data.provider";
import {ChartsService} from "../../../services/charts.service";
// @ts-ignore
import risk_assessment from "../../../../assets/charts-params/risk-assessment.json";
// @ts-ignore
import risk_identification from "../../../../assets/charts-params/risk-identification.json";
import {Filter} from "../../../models/filter.model";


@Component({
  selector: 'approach-to-risks-alt-one',
  templateUrl: './approach-to-risks.component.html',
  styleUrls: ['./approach-to-risks.component.scss']
})
export class ApproachToRisksAltOneComponent implements OnInit, OnChanges {
  isLoading: boolean = true;
  year: number | string = '';
  @Input()
  sector !: string;
  percentage_of_companies_identified_risks: number = 0;

  constructor(private dataProvider: DataProvider, private chartsService: ChartsService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.updateData()
  }

  ngOnInit(): void {
  }

  updateData() {
    let company_group = this.dataProvider.getCompanyGroup(this.sector);
    this.isLoading = true;

    this.dataProvider.getAnswers(this.dataProvider.metrics.aus_msa_statement_assessed,
      [new Filter("year", this.year), new Filter("value", "Yes"), new Filter("company_group", company_group)]).subscribe(aus_assessed => {
      this.dataProvider.getAnswers(this.dataProvider.metrics.uk_msa_statement_assessed,
        [new Filter("year", this.year), new Filter("value", "Yes"), new Filter("company_group", company_group)]).subscribe(uk_assessed => {
        // @ts-ignore
        let assessed = [...new Set([...aus_assessed, ...uk_assessed])];
        assessed = assessed.filter((arr, index, self) =>
          index === self.findIndex((t) => (t.company === arr.company && t.year === arr.year)))
        this.dataProvider.getAnswers(6916242,
          [new Filter("year", this.year), new Filter("value", "Yes"), new Filter("company_group", company_group)]).subscribe(reported_risks => {
          // @ts-ignore
          reported_risks = reported_risks.filter((a: { company: any; year: any; }) => assessed.some(statement => statement.company == a.company && statement.year == a.year))
          this.percentage_of_companies_identified_risks = Math.round(reported_risks.length * 100 / assessed.length);
        }, error => {
          console.log(error)
        }, () => {
          this.chartsService.drawBarChart(
            "Risk Assessment",
            "div#risk-assessment-alt-one",
            350,
            200,
            this.dataProvider.metrics.msa_statement_assessed,
            risk_assessment,
            this.year,
            company_group,
            {renderer: "svg", actions: {source: false, editor: true}}).finally(() => {
            this.chartsService.drawBarChart(
              "Risks identified by risk category",
              "div#risk-identification-alt-one",
              350,
              250,
              this.dataProvider.metrics.msa_statement_assessed,
              risk_identification,
              this.year,
              company_group,
              {
                renderer: "svg",
                actions: {source: false, editor: true}
              }).finally(() => this.chartsService.drawSubgroupsBarChart(
              "Risks Management",
              "div#risk-management-alt-one",
              350,
              this.dataProvider.metrics.msa_statement_assessed,
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
              company_group,
              {renderer: "svg", actions: {source: false, editor: true}})).finally(() => this.isLoading = false
              //   this.chartsService.drawPieChartGroups(
              //   "RISK ASSESSMENT TOOL & RISKS IDENTIFIED",
              //   this.year,
              //   [this.dataProvider.metrics.uk_msa_statement_assessed, this.dataProvider.metrics.aus_msa_statement_assessed],
              //   6933622,
              //   ["#e17327",
              //     "#c7594b",
              //     "#ad3d6f",
              //     "#932191",
              //     "#000028"],
              //   [{"name": "Performs assessment and identifies risks"},
              //     {"name": "Performs assessment but does not identify risks"},
              //     {"name": "Does not perform assessment but identifies risks"},
              //     {"name": "Does not perform assessment or identify risks"},
              //     {"name": "Unknown"}],
              //   "div#risk-tools",
              //   250, 180, {
              //     renderer: "svg",
              //     actions: {source: false, editor: true}
              //   }
              // ).finally(() => this.isLoading = false)
            )

          })
        })
      })
    })

  }

}
