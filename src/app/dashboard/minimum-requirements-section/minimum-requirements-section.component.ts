import {Component, OnInit} from '@angular/core';
import {DataProvider} from "../../services/data.provider";
import {Filter} from "../../models/filter.model";
import {ChartsService} from "../../services/charts.service";
// @ts-ignore
import uk_minimum_requirements from "../../../assets/charts-params/uk-minimum-requirements.json";
// @ts-ignore
import aus_minimum_requirements from "../../../assets/charts-params/aus-minimum-requirements.json";
import {ActivatedRoute, ParamMap} from "@angular/router";
import {SectorProvider} from "../../services/sector.provider";
import {forkJoin} from "rxjs";

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

  updateData() {
    let company_group = this.dataProvider.getCompanyGroup(this.sector)
    this.isLoading = true;
    this.draw_minimum_requirements_pie_chart(
      "Meet Minimun UK Requirements",
      "div#uk-meet-min-requirements",
      this.dataProvider.metrics.uk_msa_statement_assessed,
      this.dataProvider.metrics.meet_uk_min_requirements, company_group)

    this.chartsService.drawMinimumRequirementsBarChart(
      "Which minimum uk requirements do these companies meet?",
      "div#uk-requirements-bars",
      350,
      200,
      this.dataProvider.metrics.uk_msa_statement_assessed,
      uk_minimum_requirements,
      this.year,
      company_group,
      {renderer: "svg", actions: false})

    if (this.year >= 2020 || this.year == '' || this.year == 'latest') {
      this.draw_minimum_requirements_pie_chart(
        "Meet Minimun Australian Requirements",
        "div#aus-meet-min-requirements",
        this.dataProvider.metrics.aus_msa_statement_assessed,
        this.dataProvider.metrics.meet_aus_min_requirements, company_group)

      this.chartsService.drawMinimumRequirementsBarChart(
        "Which minimum aus requirements do these companies meet?",
        "div#aus-requirements-bars",
        350, 670,
        this.dataProvider.metrics.aus_msa_statement_assessed,
        aus_minimum_requirements,
        this.year,
        company_group,
        {renderer: "svg", actions: false})
    }
  }


  draw_minimum_requirements_pie_chart(title: string, element: string, assessed_statements_metric_id: number, meet_min_requirements_metric_id: number, company_group: string) {
    const assessed_statements = this.dataProvider.getAnswers(assessed_statements_metric_id,
      [
        new Filter("year", this.year),
        new Filter("value", ["Yes"]),
        new Filter("company_group", company_group)
      ])

    const meet_requirements = this.dataProvider.getAnswers(meet_min_requirements_metric_id,
      [
        new Filter("year", this.year),
        new Filter("value", ["Yes"]),
        new Filter("company_group", company_group)
      ])

    forkJoin([assessed_statements, meet_requirements]).subscribe(results => {
      let assessed = results[0].length
      if (assessed_statements_metric_id === this.dataProvider.metrics.uk_msa_statement_assessed) {
        this.uk_assessed = results[0].length
      } else {
        this.aus_assessed = results[0].length
      }

      let meet_min_requirements = results[1].length
      this.chartsService.drawPieChart(
        title,
        element,
        [{
          'value': 'Met',
          'count': meet_min_requirements,
          'sum_count': assessed
        },
          {
            'value': 'Not Met',
            'count': assessed - meet_min_requirements,
            'sum_count': assessed
          }],
        210, 180, ["#000029", "#FF5C45"],
        ["Not Met", "Met"], {renderer: "svg", actions: false})
      this.isLoading = false
    })
  }

}
