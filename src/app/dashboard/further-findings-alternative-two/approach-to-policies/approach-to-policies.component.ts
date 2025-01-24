import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { DataProvider } from "../../../services/data.provider";
import { ChartsService } from "../../../services/charts.service";
import { Filter } from "../../../models/filter.model";
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, forkJoin } from 'rxjs';

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
  modern_slavery_policies;
  modern_slavery_training;
  params = ''

  isLoading: boolean = true;
  isDataLoaded: boolean = false;

  constructor(private dataProvider: DataProvider, private chartsService: ChartsService, private httpClient: HttpClient) {
  }

  ngOnInit(): void {
    const dataPaths = ['/assets/charts-params/modern-slavery-policies.json', '/assets/charts-params/modern-slavery-training.json']

    this.dataProvider.loadData(dataPaths).subscribe({
      next: ([policies, training]) => {
        this.modern_slavery_policies = policies;
        this.modern_slavery_training = training;

        // Notify that data is loaded
        this.dataProvider.markDataAsLoaded()
      },
      error: (error) => {
        console.error('Failed to load data:', error);
      }
    });

    // Subscribe to isDataLoaded$ to trigger updateData
    this.dataProvider.isDataLoaded$.subscribe((isLoaded) => {
      if (isLoaded) {
        this.updateData();
        this.isDataLoaded = true;
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.isDataLoaded){
      this.updateData();
    }
  }

  updateData() {
    this.isLoading = true;
    this.company_group = []
    if (this.sector != 'all-sectors')
      this.company_group.push(this.dataProvider.getCompanyGroup(this.sector))
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
      this.modern_slavery_policies,
      this.year,
      this.company_group,
      {
        renderer: "svg",
        actions: false
      }).finally(() => {
        this.chartsService.drawBarChart(
          "Modern Slavery Training",
          "div#training-alt-two",
          350,
          350,
          assessed_statements_metric_id,
          this.modern_slavery_training,
          this.year,
          this.company_group,
          { renderer: "svg", actions: false }).finally(() => {
            this.isLoading = false
          })
      })
  }
}
