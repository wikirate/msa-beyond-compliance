import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {DataProvider} from "../../../services/data.provider";
import {ChartsService} from "../../../services/charts.service";
import {delay} from "rxjs";
// @ts-ignore
import modern_slavery_policies from "../../../../assets/charts-params/modern-slavery-policies.json";
import {Filter} from "../../../models/filter.model";

@Component({
  selector: 'approach-to-policies-alt-one',
  templateUrl: './approach-to-policies.component.html',
  styleUrls: ['./approach-to-policies.component.scss']
})
export class ApproachToPoliciesAltOneComponent implements OnInit, OnChanges {

  year: number | string = '';
  @Input()
  sector !: string;
  isLoading: boolean = true;
  percentage_of_companies_report_policy_beyond_t1: number = 0;

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
        this.dataProvider.getAnswers(6915846,
          [new Filter("year", this.year), new Filter("value", "Yes"), new Filter("company_group", company_group)]).subscribe(beyond_t1 => {
          // @ts-ignore
          beyond_t1 = beyond_t1.filter((a: { company: any; year: any; }) => assessed.some(statement => statement.company == a.company && statement.year == a.year))
          this.percentage_of_companies_report_policy_beyond_t1 = Math.round(beyond_t1.length * 100 / assessed.length);
        })
      }, error => {
        console.log(error)
      }, () => {
        this.chartsService.drawBarChart(
          "Modern Slavery Supply Chain Policies",
          "div#modern-slavery-supply-chain-policies-alt-one",
          350,
          250,
          this.dataProvider.metrics.msa_statement_assessed,
          modern_slavery_policies,
          this.year,
          company_group,
          {
            renderer: "svg",
            actions: {source: false, editor: true}
          }).finally(() => this.isLoading = false)
      })
    })

  }
}
