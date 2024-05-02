import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { find, forkJoin, map } from 'rxjs';
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
  isLoading: boolean = false;

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

          collaborations_and_memberships_response.filter((item: any) => assessed_response.find((o: any) => o.company == item.company && o.year == item.year))
          workers_engagement_response.filter((item: any) => assessed_response.find((o: any) => o.company == item.company && o.year == item.year))
          living_wage_response.filter((item: any) => assessed_response.find((o: any) => o.company == item.company && o.year == item.year))
        }

        let statements_reporting_workers_engagement = workers_engagement_response.filter((x: any) => x['value'] == 'Yes with workers' || x['value'] == 'Yes with labor unions').length
        let statements_reporting_living_wage_commitment = living_wage_response.filter((x: any) => x['value'] == 'Yes').length
        let statements_reporting_collaborations_and_memberships = collaborations_and_memberships_response.filter((x: any) => x['value'] == 'Yes').length
        return {
          'collaborations_and_memberships': Math.round(statements_reporting_collaborations_and_memberships * 100 / collaborations_and_memberships_response.length),
          'workers_engagement': Math.round(statements_reporting_workers_engagement * 100 / workers_engagement_response.length),
          'living_wage': Math.round(statements_reporting_living_wage_commitment * 100 / living_wage_response.length)
        }
      }))
      .subscribe(results => {
        this.collaborationsAndMemberships = results.collaborations_and_memberships
        this.workersEngagement = results.workers_engagement
        this.livingWageCommitment = results.living_wage

        //loading stops when all requests and calculations have been performed successfully
        this.isLoading = false

        this.chartsService.drawSingleBar("Living wage in supply chains", this.dataProvider.metrics.msa_living_wage, "div#living-wage-chart", {renderer: "svg", actions: false}, this.year)
        this.chartsService.drawSingleBar("Collaborations and Memberships", this.dataProvider.metrics.msa_collaborations_and_membership, "div#collaborations-and-memberships-chart", {renderer: "svg", actions: false}, this.year)
        this.chartsService.drawSingleBar("Workers Engagement", this.dataProvider.metrics.msa_workers_engagement, "div#workers-engagement-chart", {renderer: "svg", actions: false}, this.year)
      })
  }



}
