import {Component, OnInit} from '@angular/core';
import {DataProvider} from "../../services/data.provider";
import {ChartsService} from "../../services/charts.service";
import {ActivatedRoute, ParamMap} from "@angular/router";
import {SectorProvider} from "../../services/sector.provider";
import {Meta, Title} from "@angular/platform-browser";

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
              private sectorProvider: SectorProvider, private titleService: Title, private meta: Meta) {

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
      if (val[1].path === 'assessed-statements-overview') {
        this.titleService.setTitle("Beyond Compliance: Assessed Statements")
        this.meta.updateTag({
          name: 'og:title',
          content: "Beyond Compliance: Assessed Statements"
        })
        this.meta.updateTag({
          name: 'twitter:title',
          content: "Beyond Compliance: Assessed Statements."
        })
        this.meta.updateTag({
          name: 'description',
          content: "Whose statements have been assessed? The larger the company's turnover or revenue the bigger their operations and influence tend to be."
        })
        this.meta.updateTag({
          name: 'og:description',
          content: "Whose statements have been assessed? The larger the company's turnover or revenue the bigger their operations and influence tend to be."
        })
        this.meta.updateTag({
          name: 'twitter:description',
          content: "Whose statements have been assessed? The larger the company's turnover or revenue the bigger their operations and influence tend to be."
        })
        this.sectorProvider.getPath().next(val[1].path)
      }
    })
  }

  getSectorName(): any {
    return (this.dataProvider.sectors as any)[this.sector]
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
      let year: string | number = 'latest'
      if (this.year != '') {
        year = this.year
      }

      this.chartService.drawBeeSwarmChart(
        "Companies Overview",
        year,
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
      let color = '#000029'
      if (company_group === 'MSA_Garment')
        color = '#FFCB2B'
      else if (company_group === 'MSA_Financial')
        color = '#FF5C45'
      else if (company_group === 'MSA_Food_Beverage')
        color = '#FFBEB5'
      else if (company_group === 'MSA_Renewable_Energy')
        color = '#8686AD'
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
