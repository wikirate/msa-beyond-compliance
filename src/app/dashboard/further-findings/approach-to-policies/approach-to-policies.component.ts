import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {DataProvider} from "../../../services/data.provider";
import {ChartsService} from "../../../services/charts.service";
import {delay} from "rxjs";
// @ts-ignore
import modern_slavery_policies from "../../../../assets/charts-params/modern-slavery-policies.json";

@Component({
  selector: 'approach-to-policies',
  templateUrl: './approach-to-policies.component.html',
  styleUrls: ['./approach-to-policies.component.scss']
})
export class ApproachToPoliciesComponent implements OnInit, OnChanges {

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
    this.isLoading = true;
    this.chartsService.drawBarChart(
      "Modern Slavery Supply Chain Policies",
      "div#modern-slavery-supply-chain-policies",
      350,
      250,
      [this.dataProvider.metrics.uk_msa_statement_assessed, this.dataProvider.metrics.aus_msa_statement_assessed],
      modern_slavery_policies,
      this.year,
      {
        renderer: "svg",
        actions: {source: false, editor: true}
      }).finally(() => this.isLoading = false)

  }
}
