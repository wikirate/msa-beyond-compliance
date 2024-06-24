import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin, map } from 'rxjs';
import { Filter } from 'src/app/models/filter.model';
import { ChartsService } from 'src/app/services/charts.service';
import { DataProvider } from 'src/app/services/data.provider';
import { SectorProvider } from 'src/app/services/sector.provider';
import { WikirateUrlBuilder } from 'src/app/utils/wikirate-url-builder';

@Component({
  selector: 'spotlight-metrics',
  templateUrl: './spotlight-metrics.component.html',
  styleUrls: ['./spotlight-metrics.component.scss']
})
export class SpotlightMetricsComponent implements OnInit {
  sector: string = "all-sectors";
  company_group: string[] = []

  year: string = ''
  legislation: string = 'both'
  isLoading: boolean = true;

  collaborations_and_memberships_url = '#';
  workers_engagement_url: string = '#';
  living_wage_commitment_url: string = '#';

  collaborationsAndMemberships!: number;
  workersEngagement!: number;
  livingWageCommitment!: number;


  constructor(private dataProvider: DataProvider, private modalService: NgbModal,
    private route: ActivatedRoute, private sectorProvider: SectorProvider,
    private chartsService: ChartsService) {

  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params: ParamMap) => {
      let sector = params.get('sector');
      if (sector !== null) {
        this.sector = sector
        this.updateData(this.year)
      }
      this.sectorProvider.getSector().next(sector);
    })
  }

  getSectorName(): any {
    return (this.dataProvider.sectors as any)[this.sector]
  }

  updateData($event: any) {
    this.isLoading = true
    this.company_group = []
    if (this.sector != 'all-sectors')
      this.company_group.push(this.dataProvider.getCompanyGroup(this.sector))
    if (this.legislation === 'uk') {
      this.company_group.push(this.dataProvider.companies_with_assessed_statement.uk)
    } else if (this.legislation === 'aus') {
      this.company_group.push(this.dataProvider.companies_with_assessed_statement.aus)
    } else {
      this.company_group.push(this.dataProvider.companies_with_assessed_statement.any)
    }
    this.findings()
    return this.year;
  }

  findings() {
    //build urls to link the numbers to wikirate metrics with proper filters applied
    this.collaborations_and_memberships_url = new WikirateUrlBuilder()
      .setEndpoint(this.dataProvider.metrics.msa_collaborations_and_membership)
      .addFilter(new Filter('value', ['Yes']))
      .addFilter(new Filter('company_group', this.company_group))
      .addFilter(new Filter('year', this.year))
      .build()

    this.workers_engagement_url = new WikirateUrlBuilder()
      .setEndpoint(this.dataProvider.metrics.msa_workers_engagement)
      .addFilter(new Filter('value', ['Yes']))
      .addFilter(new Filter('company_group', this.company_group))
      .addFilter(new Filter('year', this.year))
      .build()

    this.living_wage_commitment_url = new WikirateUrlBuilder()
      .setEndpoint(this.dataProvider.metrics.msa_living_wage)
      .addFilter(new Filter('value', ['Yes']))
      .addFilter(new Filter('company_group', this.company_group))
      .addFilter(new Filter('year', this.year))
      .build()

    //prepare all requests that need to be executed
    let assessed_filters = [
      new Filter("year", this.year),
      new Filter("value", ["Yes"]),
      new Filter("company_group", this.company_group)
    ]
    if (this.year == 'latest') {
      assessed_filters = [
        new Filter("value", ["Yes"]),
        new Filter("company_group", this.company_group)
      ]
    }
    const assessed = this.dataProvider.getAnswers(this.dataProvider.metrics.msa_statement_assessed, assessed_filters)

    const collaborations_and_memberships = this.dataProvider.getAnswers(this.dataProvider.metrics.msa_collaborations_and_membership,
      [
        new Filter("year", this.year),
        new Filter("company_group", this.company_group)
      ])

    const workers_engagement = this.dataProvider.getAnswers(this.dataProvider.metrics.msa_workers_engagement,
      [
        new Filter("year", this.year),
        new Filter("company_group", this.company_group)
      ])

    const living_wage = this.dataProvider.getAnswers(this.dataProvider.metrics.msa_living_wage,
      [
        new Filter("year", this.year),
        new Filter("company_group", this.company_group)
      ])

    /**perform the requests using forkJoin to get all the results before start calculating the key findings**/
    forkJoin([assessed, collaborations_and_memberships, workers_engagement, living_wage])
      .pipe(map(([assessed_response, collaborations_and_memberships_response, workers_engagement_response, living_wage_response]) => {
        if (this.year == 'latest') {
          assessed_response = Object.values(assessed_response.reduce((r: any, o: any) => {
            r[o.company] = (r[o.company] && r[o.company].year > o.year) ? r[o.company] : o

            return r
          }, {}))
        }

        collaborations_and_memberships_response.filter((item: any) => assessed_response.find((o: any) => o.company == item.company && o.year == item.year))
        workers_engagement_response.filter((item: any) => assessed_response.find((o: any) => o.company == item.company && o.year == item.year))
        living_wage_response.filter((item: any) => assessed_response.find((o: any) => o.company == item.company && o.year == item.year))


        let statements_reporting_workers_engagement = workers_engagement_response.filter((x: any) => x['value'].includes('Yes with workers') || x['value'].includes('Yes with labor unions')).length
        let statements_reporting_living_wage_commitment = living_wage_response.filter((x: any) => x['value'] == 'Yes').length
        let statements_reporting_collaborations_and_memberships = collaborations_and_memberships_response.filter((x: any) => x['value'] == 'Yes').length

        return {
          'assessed_collaborations_and_memberships': collaborations_and_memberships_response.length,
          'collaborations_and_memberships': statements_reporting_collaborations_and_memberships,
          'assessed_workers_engagement': workers_engagement_response.length,
          'workers_engagement': statements_reporting_workers_engagement,
          'assessed_living_wage': living_wage_response.length,
          'living_wage': statements_reporting_living_wage_commitment
        }
      }))
      .subscribe({
        next: results => {
          this.collaborationsAndMemberships = Math.round(results.collaborations_and_memberships * 100 / results.assessed_collaborations_and_memberships),
            this.workersEngagement = Math.round(results.workers_engagement * 100 / results.assessed_workers_engagement),
            this.livingWageCommitment = Math.round(results.living_wage * 100 / results.assessed_living_wage)

          this.chartsService.drawSingleBar("Living wage in supply chains",
            "div#living-wage-chart",
            [{ "meet_criteria": results.living_wage, "num_of_assessed": results.assessed_living_wage }],
            this.living_wage_commitment_url,
            { renderer: "svg", actions: false })

          this.chartsService.drawSingleBar("Collaborations and Memberships", "div#collaborations-and-memberships-chart",
            [{ "meet_criteria": results.collaborations_and_memberships, "num_of_assessed": results.assessed_collaborations_and_memberships }],
            this.collaborations_and_memberships_url,
            { renderer: "svg", actions: false })

          this.chartsService.drawSingleBar("Workers Engagement", "div#workers-engagement-chart",
            [{ "meet_criteria": results.workers_engagement, "num_of_assessed": results.assessed_workers_engagement }],
            this.workers_engagement_url,
            { renderer: "svg", actions: false })
        },
        complete: () => this.isLoading = false
      })
  }
}
