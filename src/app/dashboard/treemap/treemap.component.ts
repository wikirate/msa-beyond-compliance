import {Component, Input, OnInit} from '@angular/core';
import {DataProvider} from "../../services/data.provider";
import {Filter} from "../../models/filter.model";
import {stringify} from "@angular/compiler/src/util";
import {ChartsService} from "../../services/charts.service";

@Component({
  selector: 'treemap',
  templateUrl: './treemap.component.html',
  styleUrls: ['./treemap.component.scss']
})
export class TreemapComponent implements OnInit {
  @Input()
  sector!: string;
  year: number | string = '';
  legislation: string = 'both';
  isLoading: boolean = true;

  constructor(private dataProvider: DataProvider, private chartService: ChartsService) {
  }

  ngOnInit(): void {
    this.updateData()
  }

  updateData() {
    this.isLoading = true;
    if (this.legislation == 'both') {
      this.chartService.drawBeeSwormChart(
        "Companies Overview",
        this.year,
        this.dataProvider.metrics.msa_statement_assessed,
        [],
        'div#tree-map',
        0,
        0,
        {
          renderer: "svg",
          actions: {source: false, editor: true}
        }
      ).finally(() => this.isLoading = false)
    } else if (this.legislation === 'uk') {
      this.chartService.drawBeeSwormChart(
        "Companies Overview",
        this.year,
        this.dataProvider.metrics.uk_msa_statement_assessed,
        [],
        'div#tree-map',
        0,
        0,
        {
          renderer: "svg",
          actions: {source: false, editor: true}
        }
      ).finally(() => this.isLoading = false)
    } else {
      this.chartService.drawBeeSwormChart(
        "Companies Overview",
        this.year,
        this.dataProvider.metrics.aus_msa_statement_assessed,
        [],
        'div#tree-map',
        0,
        0,
        {
          renderer: "svg",
          actions: {source: false, editor: true}
        }
      ).finally(() => this.isLoading = false)
    }
  }
}
