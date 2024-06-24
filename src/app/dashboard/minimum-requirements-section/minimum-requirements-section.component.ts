import { Component, OnInit } from '@angular/core';
import { DataProvider } from "../../services/data.provider";
import { Filter } from "../../models/filter.model";
import { ChartsService } from "../../services/charts.service";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { SectorProvider } from "../../services/sector.provider";
import { WikirateUrlBuilder } from 'src/app/utils/wikirate-url-builder';

@Component({
  selector: 'minimum-requirements-section',
  templateUrl: './minimum-requirements-section.component.html',
  styleUrls: ['./minimum-requirements-section.component.scss']
})
export class MinimumRequirementsSectionComponent implements OnInit {
  sector: string = "all-sectors";
  year: number | string = ""
  isLoading: boolean = true;
  aus_assessed = 0;
  uk_assessed = 0;
  uk_legislation_info = "The UK legislation only requires three criteria, none of which relate to the quality of the statement. Therefore, a direct comparison of minimum compliance between Australian and UK is difficult."

  constructor(private dataProvider: DataProvider, private chartsService: ChartsService, private route: ActivatedRoute,
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
      if (val[1].path === 'meeting-minimum-requirements')
        this.sectorProvider.getPath().next(val[1].path)
    })
  }

  getSectorName(): any {
    return (this.dataProvider.sectors as any)[this.sector]
  }

  updateData() {
    let uk_company_group = [this.dataProvider.companies_with_assessed_statement.uk]
    let aus_company_group = [this.dataProvider.companies_with_assessed_statement.aus]
    if (this.dataProvider.getCompanyGroup(this.sector) != '') {
      uk_company_group.push(this.dataProvider.getCompanyGroup(this.sector))
      aus_company_group.push(this.dataProvider.getCompanyGroup(this.sector))
    }

    const uk_meet_min_requirements_url = new WikirateUrlBuilder()
      .setEndpoint(this.dataProvider.metrics.meet_uk_min_requirements)
      .addFilter(new Filter('value', ['Yes']))
      .addFilter(new Filter('company_group', uk_company_group))
      .addFilter(new Filter('year', this.year))
      .build()

    const aus_meet_min_requirements_url = new WikirateUrlBuilder()
      .setEndpoint(this.dataProvider.metrics.meet_aus_min_requirements)
      .addFilter(new Filter('value', ['Yes']))
      .addFilter(new Filter('company_group', aus_company_group))
      .addFilter(new Filter('year', this.year))
      .build()
    
    this.isLoading = true;
    this.draw_minimum_requirements_pie_chart(
      "Meet Minimun UK Requirements",
      "div#uk-meet-min-requirements",
      uk_meet_min_requirements_url,
      this.dataProvider.metrics.meet_uk_min_requirements, uk_company_group)

    if (this.year >= '2020' || this.year == '' || this.year == 'latest') {
      this.draw_minimum_requirements_pie_chart(
        "Meet Minimun Australian Requirements",
        "div#aus-meet-min-requirements",
        aus_meet_min_requirements_url,
        this.dataProvider.metrics.meet_aus_min_requirements, aus_company_group)
    }
  }


  draw_minimum_requirements_pie_chart(title: string, element: string, wikirate_url: string, meet_min_requirements_metric_id: number, company_group: string[]) {
    const meet_requirements = this.dataProvider.getAnswers(meet_min_requirements_metric_id,
      [
        new Filter("year", this.year),
        new Filter("value", ["Yes", "No", "Unknown"]),
        new Filter("company_group", company_group)
      ])

    meet_requirements.subscribe(results => {
      let assessed = results.length

      if (company_group.includes(this.dataProvider.companies_with_assessed_statement.uk)) {
        this.uk_assessed = assessed
      } else {
        this.aus_assessed = assessed
      }
      // @ts-ignore
      let meet_min_requirements = results.filter(item => item['value'] === "Yes").length

      this.chartsService.drawPieChart(
        title,
        element,
        [{
          'value': 'Met',
          'count': meet_min_requirements,
          'sum_count': assessed,
          'wikirate_page': wikirate_url
        },
        {
          'value': 'Not Met',
          'count': assessed - meet_min_requirements,
          'sum_count': assessed,
          'wikirate_page': wikirate_url
        }],
        210, 180, ["#000029", "#FF5C45"],
        ["Not Met", "Met"], { renderer: "svg", actions: false })
      this.isLoading = false
    })
  }

}
