import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {DataProvider} from "../../../services/data.provider";
import {ChartsService} from "../../../services/charts.service";
import {delay} from "rxjs";
// @ts-ignore
import modern_slavery_policies from "../../../../assets/charts-params/modern-slavery-policies.json";
import {Filter} from "../../../models/filter.model";

@Component({
  selector: 'approach-to-policies',
  templateUrl: './approach-to-policies.component.html',
  styleUrls: ['./approach-to-policies.component.scss']
})
export class ApproachToPoliciesComponent implements OnInit, OnChanges {

  @Input()
  year!: number | string;
  @Input()
  sector !: string;
  @Input()
  legislation!: string;
  company_group: string[] = [];
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
    this.isLoading = true;

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
      "Modern Slavery Supply Chain Policies",
      "div#modern-slavery-supply-chain-policies-alt-two",
      350,
      250,
      assessed_statements_metric_id,
      modern_slavery_policies,
      this.year,
      this.company_group,
      {
        renderer: "svg",
        actions: false
      }).finally(() => this.isLoading = false)

  }
}
