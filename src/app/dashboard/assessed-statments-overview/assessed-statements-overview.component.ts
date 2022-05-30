import {Component, OnInit} from '@angular/core';
import {DataProvider} from "../../services/data.provider";
import {ChartsService} from "../../services/charts.service";
import {ActivatedRoute, ParamMap} from "@angular/router";
import {SectorProvider} from "../../services/sector.provider";

@Component({
  selector: 'assessed-statements-overview',
  templateUrl: './assessed-statements-overview.component.html',
  styleUrls: ['./assessed-statements-overview.component.scss']
})
export class AssessedStatementsOverviewComponent implements OnInit {
  sector: string = 'all-sectors';
  year: number | string = '';
  legislation: string = 'both';
  isLoading: boolean = true;

  constructor(private dataProvider: DataProvider, private chartService: ChartsService, private route: ActivatedRoute,
              private sectorProvider: SectorProvider) {
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params: ParamMap) => {
        let sector = params.get('sector');
        if (sector !== null) {
          this.sector = sector
          this.updateData()
        }
        this.sectorProvider.getSector().next(sector);
      }
    )
    this.route.url.subscribe(val => {
      if (val[1].path === 'assessed-statements-overview')
        this.sectorProvider.getPath().next(val[1].path)
    })
  }

  updateData() {
    this.isLoading = true;
    let msa_statement_assessed_metric_id = this.dataProvider.metrics.msa_statement_assessed;
    if (this.legislation == 'uk') {
      msa_statement_assessed_metric_id = this.dataProvider.metrics.uk_msa_statement_assessed;
    } else if (this.legislation == 'aus') {
      msa_statement_assessed_metric_id = this.dataProvider.metrics.aus_msa_statement_assessed;
    }
    let company_group = this.dataProvider.getCompanyGroup(this.sector)
    if (company_group == '') {

      this.chartService.drawBeeSwarmChart(
        "Companies Overview",
        this.year,
        msa_statement_assessed_metric_id,
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
      let color = '#000028'
      if (company_group === 'MSA Garment') {
        color = '#ffdc00'
      } else if (company_group === 'MSA Financial') {
        color = '#ff9300'
      }
      this.chartService.drawSectorSpecificBeeSwarmChart(
        "Companies Overview",
        this.year,
        msa_statement_assessed_metric_id,
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
