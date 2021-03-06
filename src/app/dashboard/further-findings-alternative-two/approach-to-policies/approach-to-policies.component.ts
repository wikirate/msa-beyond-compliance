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
  company_group: string = '';

  isLoading: boolean = true;

  constructor(private dataProvider: DataProvider, private chartsService: ChartsService) {
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.updateData()
  }

  updateData() {
    this.company_group = this.dataProvider.getCompanyGroup(this.sector)
    this.isLoading = true;
    this.chartsService.drawBarChart(
      "Modern Slavery Supply Chain Policies",
      "div#modern-slavery-supply-chain-policies-alt-two",
      350,
      250,
      this.dataProvider.metrics.msa_statement_assessed,
      modern_slavery_policies,
      this.year,
      this.company_group,
      {
        renderer: "svg",
        actions: false
      }).finally(() => this.isLoading = false)

  }
}
