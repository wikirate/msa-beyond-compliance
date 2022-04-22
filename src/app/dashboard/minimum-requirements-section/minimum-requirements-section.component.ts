import {Component, OnInit} from '@angular/core';
import {DataProvider} from "../../services/data.provider";
import {Filter} from "../../models/filter.model";
import {ChartsService} from "../../services/charts.service";
// @ts-ignore
import uk_minimum_requirements from "../../../assets/charts-params/uk-minimum-requirements.json";
// @ts-ignore
import aus_minimum_requirements from "../../../assets/charts-params/aus-minimum-requirements.json";

@Component({
  selector: 'minimum-requirements-section',
  templateUrl: './minimum-requirements-section.component.html',
  styleUrls: ['./minimum-requirements-section.component.scss']
})
export class MinimumRequirementsSectionComponent implements OnInit {
  year: number | string = "latest"
  isLoading: boolean = true;

  constructor(private dataProvider: DataProvider, private chartsService: ChartsService) {
  }

  ngOnInit(): void {
    this.updateData()
  }

  updateData() {
    this.isLoading = true;
    this.draw_minimum_requirements_pie_chart(
      "Meet Minimun UK Requirements",
      "div#uk-meet-min-requirements",
      this.dataProvider.metrics.uk_msa_statement_assessed,
      this.dataProvider.metrics.meet_uk_min_requirements)

    this.draw_minimum_requirements_pie_chart(
      "Meet Minimun Australian Requirements",
      "div#aus-meet-min-requirements",
      this.dataProvider.metrics.aus_msa_statement_assessed,
      this.dataProvider.metrics.meet_aus_min_requirements)

    this.chartsService.drawMinimumRequirementsBarChart(
      "Which minimum uk requirements do these companies meet?",
      "div#uk-requirements-bars",
      350,
      200,
      this.dataProvider.metrics.uk_msa_statement_assessed,
      uk_minimum_requirements,
      this.year,
      {renderer: "svg", actions: {source: false, editor: false}})
    this.chartsService.drawMinimumRequirementsBarChart(
      "Which minimum aus requirements do these companies meet?",
      "div#aus-requirements-bars",
      350, 670,
      this.dataProvider.metrics.aus_msa_statement_assessed,
      aus_minimum_requirements,
      this.year,
      {renderer: "svg", actions: {source: false, editor: false}})
  }

  draw_minimum_requirements_pie_chart(title: string, element: string, assessed_statements_metric_id: number, meet_min_requirements_metric_id: number) {
    this.dataProvider.getAnswers(assessed_statements_metric_id,
      [new Filter("year", this.year), new Filter("value", "Yes")]).subscribe(data => {
      let assessed = data.length
      this.dataProvider.getAnswers(meet_min_requirements_metric_id,
        [new Filter("year", this.year), new Filter("value", "Yes")]).subscribe(data => {
        let meet_min_requirements = data.length
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
          190, 180, ["#000028", "#FF9300"],
          ["Not Met", "Met"], {renderer: "svg", actions: {source: false, editor: false}})
      }, error => console.log(error), () => this.isLoading = false)
    })
  }

}
