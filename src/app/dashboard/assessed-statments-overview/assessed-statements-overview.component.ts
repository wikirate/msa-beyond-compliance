import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {DataProvider} from "../../services/data.provider";
import {ExportAsService, ExportAsConfig} from 'ngx-export-as';
import {ChartsService} from "../../services/charts.service";

@Component({
  selector: 'assessed-statements-overview',
  templateUrl: './assessed-statements-overview.component.html',
  styleUrls: ['./assessed-statements-overview.component.scss']
})
export class AssessedStatementsOverviewComponent implements OnInit, OnChanges {
  @Input()
  sector!: string;
  year: number | string = '';
  legislation: string = 'both';
  isLoading: boolean = true;

  exportAsConfig: ExportAsConfig = {
    type: 'png', // the type you want to download
    elementIdOrContent: "tree-map-section", // the id of html/table element
  }

  constructor(private dataProvider: DataProvider, private chartService: ChartsService, private exportAsService: ExportAsService) {
  }

  ngOnInit(): void {
    this.updateData()
  }

  ngOnChanges(changes: SimpleChanges) {
    this.updateData()
  }

  export() {
    this.exportAsService.save(this.exportAsConfig, 'statements-overview').subscribe(() => {
    });
  }

  updateData() {
    this.isLoading = true;
    let company_group = this.dataProvider.getCompanyGroup(this.sector)
    if (company_group == '') {
      if (this.legislation == 'both') {
        this.chartService.drawBeeSwarmChart(
          "Companies Overview",
          this.year,
          this.dataProvider.metrics.msa_statement_assessed,
          [],
          'div#tree-map',
          0,
          0,
          {
            renderer: "svg",
            actions: false
          }
        ).finally(() => this.isLoading = false)
      } else if (this.legislation === 'uk') {
        this.chartService.drawBeeSwarmChart(
          "Companies Overview",
          this.year,
          this.dataProvider.metrics.uk_msa_statement_assessed,
          [],
          'div#tree-map',
          0,
          0,
          {
            renderer: "svg",
            actions: false
          }
        ).finally(() => this.isLoading = false)
      } else {
        this.chartService.drawBeeSwarmChart(
          "Companies Overview",
          this.year,
          this.dataProvider.metrics.aus_msa_statement_assessed,
          [],
          'div#tree-map',
          0,
          0,
          {
            renderer: "svg",
            actions: false
          }
        ).then(() => {
        }).finally(() => this.isLoading = false)
      }
    } else {
      let color = '#000028'
      console.log(company_group)
      if (company_group === 'MSA Garments') {
        color = '#ffdc00'
      } else if (company_group === 'MSA Financial') {
        color = '#ff9300'
      }
      this.chartService.drawSectorSpecificBeeSwarmChart(
        "Companies Overview",
        this.year,
        this.dataProvider.metrics.msa_statement_assessed,
        color,
        company_group,
        'div#tree-map',
        0,
        0,
        {
          renderer: "svg",
          actions: false
        }
      ).finally(() => this.isLoading = false)
    }
  }
}
