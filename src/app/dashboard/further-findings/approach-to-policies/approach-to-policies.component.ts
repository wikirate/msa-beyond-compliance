import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {DataProvider} from "../../../services/data.provider";
import {ChartsService} from "../../../services/charts.service";
import {delay} from "rxjs";

@Component({
  selector: 'approach-to-policies',
  templateUrl: './approach-to-policies.component.html',
  styleUrls: ['./approach-to-policies.component.scss']
})
export class ApproachToPoliciesComponent implements OnInit, OnChanges {

  @Input()
  year!: number | string;

  isLoading: boolean = true;

  constructor(private dataProvider: DataProvider, private chartsService:ChartsService) {
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.updateData()
  }

  updateData() {
    this.isLoading = true;
    this.chartsService.drawPieCustomChart(
      "Modern Slavery Supply Chain Policies",
      "div#modern-slavery-supply-chain-policies",
      [this.dataProvider.metrics.uk_msa_statement_assessed, this.dataProvider.metrics.aus_msa_statement_assessed],
      2722057,
      this.year,
      250, 220,
      ["#c7594b","#FF9300"],
      ["direct","beyond tier 1"],
      {renderer: "svg", actions: {source: false, editor: true}}).finally(() => this.isLoading = false)

  }
}
