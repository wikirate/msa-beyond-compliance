import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {DataProvider} from "../../services/data.provider";
import {Filter} from "../../models/filter.model";
import {ValueRange} from "../../models/valuerange.model";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {ActivatedRoute, ParamMap} from "@angular/router";
import {SectorProvider} from "../../services/sector.provider";
import {Meta, Title} from "@angular/platform-browser";
import {forkJoin} from "rxjs";
import {WikirateUrlBuilder} from "../../utils/wikirate-url-builder";

@Component({
  selector: 'key-findings-section',
  templateUrl: './key-findings-section.component.html',
  styleUrls: ['./key-findings-section.component.scss']
})
export class KeyFindingsSectionComponent implements OnInit {
  sector: string = "all-sectors";
  company_group: string[] = []
  @ViewChild("content") content!: TemplateRef<any>;

  numOfCompaniesUnderMSA!: number;
  numOfAssessedMSAStatements!: number;
  meetsMinRequirements!: number;
  go_beyond_compliance!: number;

  year: string = ''
  legislation: string = 'both'
  isLoading: boolean = true;

  beyond_compliance_metric_url = '#'
  meet_min_requirements_metric_url: string = '#'
  msa_statement_assessed_metric_url: string = '#'
  msa_statements_metric_url: string = '#'

  constructor(private dataProvider: DataProvider, private modalService: NgbModal,
              private route: ActivatedRoute, private sectorProvider: SectorProvider,
              private titleService: Title, private meta: Meta) {

  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params: ParamMap) => {
        let sector = params.get('sector');
        if (sector !== null) {
          this.sector = sector
          this.updateData(this.year)
        }
        this.sectorProvider.getSector().next(sector);
      }
    )
    this.route.url.subscribe(val => {
      if (val[1].path === 'key-findings') {
        this.titleService.setTitle("Beyond Compliance: Key Findings")
        this.meta.updateTag({
          name: 'og:title',
          content: "Beyond Compliance: Key Findings"
        })
        this.meta.updateTag({
          name: 'twitter:title',
          content: "Beyond Compliance: Key Findings"
        })
        this.sectorProvider.getPath().next(val[1].path)
      } else {
        this.titleService.setTitle("Beyond Compliance")
        this.meta.updateTag({
          name: 'description',
          content: "Discover ESG data disclosure ratings and supplier transparency of the biggest 100 apparel companies in infographics, charts, and maps by Wikirate."
        })
        this.meta.updateTag({
          name: 'og:description',
          content: "@walkfree & @wikirate have simplified the data on the current state of modern slavery reporting in Australia and the UK. Explore the interactive dashboard to see trends on the effectiveness of this measure to #endmodernslavery."
        })
        this.meta.updateTag({
          name: 'twitter:description',
          content: "Discover ESG data disclosure ratings and supplier transparency of the biggest 100 apparel companies in infographics, charts, and maps by Wikirate."
        })
      }
    })
  }

  getSectorName(): any {
    return (this.dataProvider.sectors as any)[this.sector]
  }

  updateData($event: any) {
    this.isLoading = true;
    this.numOfAssessedMSAStatements = 0;

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

    if (this.legislation === 'both') {
      this.key_findings_calculation(
        this.dataProvider.metrics.modern_slavery_statement,
        this.dataProvider.metrics.msa_statement_assessed,
        this.dataProvider.metrics.msa_meet_min_requirements,
        this.dataProvider.metrics.msa_beyond_compliance)

      return $event;
    } else if (this.legislation === 'uk') {
      this.key_findings_calculation(
        this.dataProvider.metrics.modern_slavery_statement,
        this.dataProvider.metrics.uk_msa_statement_assessed,
        this.dataProvider.metrics.meet_uk_min_requirements,
        this.dataProvider.metrics.uk_beyond_compliance_disclosure_rate)
      return $event;
    } else {
      if (this.year !== '' && this.year !== 'latest' && Number(this.year) < 2020) {
        this.openMessage();
        this.year = '2020';
      }
      this.key_findings_calculation(
        this.dataProvider.metrics.modern_slavery_statement,
        this.dataProvider.metrics.aus_msa_statement_assessed,
        this.dataProvider.metrics.meet_aus_min_requirements,
        this.dataProvider.metrics.aus_beyond_compliance_disclosure_rate)

      return this.year;
    }
  }

  /**
   * This method performs all the necessary requests to wikirate's api to retrieve the required data in order to
   * calculate the statistics on the component. Different metrics might be used when different filtering is applied.
   * The method gets as input the ids of the metrics used for calculating the key findings.
   * @param statements_metric
   * @param assessed_statements_metric
   * @param meet_requirements_metric
   * @param beyond_compliance_metric
   */
  key_findings_calculation(statements_metric: number, assessed_statements_metric: number, meet_requirements_metric: number, beyond_compliance_metric: number) {

    let legislation_filter_value = ["Yes - UK Modern Slavery Act", "Yes - Australian Modern Slavery Act"]
    let beyond_compliance_value: any = ["Yes"]
    if (this.legislation === 'uk') {
      legislation_filter_value = ["Yes - UK Modern Slavery Act"]
      beyond_compliance_value = new ValueRange(1, '');
    } else if (this.legislation === 'aus') {
      legislation_filter_value = ["Yes - Australian Modern Slavery Act"]
      beyond_compliance_value = new ValueRange(1, '');
    }

    //build urls to link the numbers to wikirate metrics with proper filters applied
    this.msa_statements_metric_url = new WikirateUrlBuilder()
      .setEndpoint(statements_metric)
      .addFilter(new Filter('value', legislation_filter_value))
      .addFilter(new Filter('company_group', this.dataProvider.getCompanyGroup(this.sector)))
      .addFilter(new Filter('year', this.year))
      .build()

    this.meet_min_requirements_metric_url = new WikirateUrlBuilder()
      .setEndpoint(meet_requirements_metric)
      .addFilter(new Filter('value', ['Yes']))
      .addFilter(new Filter('company_group', this.company_group))
      .addFilter(new Filter('year', this.year))
      .build()

    let msa_statement_assessed_metric_wikirate_url = new WikirateUrlBuilder()
      .setEndpoint(assessed_statements_metric)
      .addFilter(new Filter('value', ['Yes']))
      .addFilter(new Filter('company_group', this.company_group))

    if (this.year != 'latest') {
      msa_statement_assessed_metric_wikirate_url.addFilter(new Filter("year", this.year))
      this.msa_statement_assessed_metric_url = msa_statement_assessed_metric_wikirate_url.build()
    }

    this.beyond_compliance_metric_url = new WikirateUrlBuilder()
      .setEndpoint(beyond_compliance_metric)
      .addFilter(new Filter("value", beyond_compliance_value))
      .addFilter(new Filter('company_group', this.company_group))
      .addFilter(new Filter('year', this.year))
      .build()

    //prepare all requests that need to be executed
    const statements = this.dataProvider.getAnswers(statements_metric,
      [
        new Filter("year", this.year),
        new Filter("value", legislation_filter_value),
        new Filter("company_group", this.dataProvider.getCompanyGroup(this.sector))
      ])
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
    const assessed = this.dataProvider.getAnswers(assessed_statements_metric, assessed_filters)

    const meet_requirements = this.dataProvider.getAnswers(meet_requirements_metric,
      [
        new Filter("year", this.year),
        new Filter("value", ["Yes"]),
        new Filter("company_group", this.company_group)
      ])

    const beyond_compliance = this.dataProvider.getAnswers(beyond_compliance_metric,
      [
        new Filter("year", this.year),
        new Filter("value", beyond_compliance_value),
        new Filter("company_group", this.company_group)
      ])

    /**perform the requests using forkJoin to get all the results before start calculating the key findings**/
    forkJoin([statements, assessed, meet_requirements, beyond_compliance]).subscribe(results => {
      if (this.year == 'latest') {
        results[1] = Object.values(results[1].reduce((r: any, o: any) => {
          r[o.company] = (r[o.company] && r[o.company].year > o.year) ? r[o.company] : o

          return r
        }, {}))

        results[2].filter((item: any) => results[1].find((o: any) => o.company == item.company && o.year == item.year))
        results[3].filter((item: any) => results[1].find((o: any) => o.company == item.company && o.year == item.year))
      }

      this.numOfCompaniesUnderMSA = results[0].length
      this.numOfAssessedMSAStatements = results[1].length

      this.meetsMinRequirements = Math.round((results[2].length / this.numOfAssessedMSAStatements) * 100)

      this.go_beyond_compliance = Math.round((results[3].length) * 100 / this.numOfAssessedMSAStatements)

      //loading stops when all requests and calculations have been performed successfully
      this.isLoading = false
    })
  }

  openMessage() {
    this.modalService.open(this.content, {centered: true});
  }
}
