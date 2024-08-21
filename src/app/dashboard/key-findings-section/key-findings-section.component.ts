import { AfterContentInit, AfterViewInit, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { DataProvider } from "../../services/data.provider";
import { Filter } from "../../models/filter.model";
import { ValueRange } from "../../models/valuerange.model";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { SectorProvider } from "../../services/sector.provider";
import { Meta, Title } from "@angular/platform-browser";
import { finalize, forkJoin, map } from "rxjs";
import { WikirateUrlBuilder } from "../../utils/wikirate-url-builder";
import { ChartsService } from 'src/app/services/charts.service';

@Component({
  selector: 'key-findings-section',
  templateUrl: './key-findings-section.component.html',
  styleUrls: ['./key-findings-section.component.scss']
})
export class KeyFindingsSectionComponent implements OnInit {
  sector: string = "all-sectors";
  company_group: string[] = []
  @ViewChild("content") content!: TemplateRef<any>;

  numOfAssessedMSAStatements!: number;
  meetsMinRequirements!: number;
  supplyChainDisclosure!: number;
  workerRemediation!: number;
  dueDilligence!: number;
  incidents!: number;

  year: string = ''
  legislation: string = 'both'
  isLoading: boolean = false;

  meet_min_requirements_metric_url: string = '#'
  msa_statement_assessed_metric_url: string = '#'
  msa_statements_metric_url: string = '#'
  supply_chain_disclosure_url: string = '#'
  worker_remediation_url: string = "#";
  due_dilligence_url: string = "#";
  incidents_url: string = "#"

  constructor(private dataProvider: DataProvider, private modalService: NgbModal,
    private route: ActivatedRoute, private sectorProvider: SectorProvider, private chartsService: ChartsService,
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
        this.dataProvider.metrics.msa_statement_assessed,
        this.dataProvider.metrics.msa_meet_min_requirements,
        this.dataProvider.metrics.msa_supply_chain_disclosure,
        this.dataProvider.metrics.msa_incidents_remediation,
        this.dataProvider.metrics.msa_supply_chain_due_dilligence,
        this.dataProvider.metrics.msa_incidents_identified)

      return $event;
    } else if (this.legislation === 'uk') {
      this.key_findings_calculation(
        this.dataProvider.metrics.uk_msa_statement_assessed,
        this.dataProvider.metrics.meet_uk_min_requirements,
        this.dataProvider.metrics.msa_supply_chain_disclosure,
        this.dataProvider.metrics.msa_incidents_remediation,
        this.dataProvider.metrics.msa_supply_chain_due_dilligence,
        this.dataProvider.metrics.msa_incidents_identified)
      return $event;
    } else {
      if (this.year !== '' && this.year !== 'latest' && Number(this.year) < 2020) {
        this.openMessage();
        this.year = '2020';
      }
      this.key_findings_calculation(
        this.dataProvider.metrics.aus_msa_statement_assessed,
        this.dataProvider.metrics.meet_aus_min_requirements,
        this.dataProvider.metrics.msa_supply_chain_disclosure,
        this.dataProvider.metrics.msa_incidents_remediation,
        this.dataProvider.metrics.msa_supply_chain_due_dilligence,
        this.dataProvider.metrics.msa_incidents_identified)
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
  key_findings_calculation(assessed_statements_metric: number,
    meet_requirements_metric: number,
    supply_chain_disclosure_metric: number,
    incidents_remediation_metric: number,
    due_dilligence_metric: number,
    incidents_metric: number) {

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

    this.supply_chain_disclosure_url = new WikirateUrlBuilder()
      .setEndpoint(supply_chain_disclosure_metric)
      .addFilter(new Filter("value", ['Geographical', 'Facility/Supplier']))
      .addFilter(new Filter('company_group', this.company_group))
      .addFilter(new Filter('year', this.year))
      .build()

    this.worker_remediation_url = new WikirateUrlBuilder()
      .setEndpoint(incidents_remediation_metric)
      .addFilter(new Filter("value", ['Worker remediation']))
      .addFilter(new Filter('company_group', this.company_group))
      .addFilter(new Filter('year', this.year))
      .build()

    this.due_dilligence_url = new WikirateUrlBuilder()
      .setEndpoint(due_dilligence_metric)
      .addFilter(new Filter("value", ['Worker remediation']))
      .addFilter(new Filter('company_group', this.company_group))
      .addFilter(new Filter('year', this.year))
      .build()

    this.incidents_url = new WikirateUrlBuilder()
      .setEndpoint(incidents_metric)
      .addFilter(new Filter("value", ['Yes']))
      .addFilter(new Filter('company_group', this.company_group))
      .addFilter(new Filter('year', this.year))
      .build()

    //prepare all requests that need to be executedF
    const assessed = this.dataProvider.getAnswers(assessed_statements_metric, [
      new Filter("value", ["Yes"]),
      new Filter("company_group", this.company_group),
      ...(this.year !== 'latest' ? [new Filter('year', this.year)] : [])
    ])

    const meet_requirements = this.dataProvider.getAnswers(meet_requirements_metric,
      [
        // new Filter("year", this.year),
        new Filter("value", ["Yes"]),
        new Filter("company_group", this.company_group),
        ...(this.year !== 'latest' ? [new Filter('year', this.year)] : [])
      ])

    const supply_chain_disclosure = this.dataProvider.getAnswers(supply_chain_disclosure_metric,
      [
        // new Filter("year", this.year),
        new Filter("value", ['Geographical', 'Facility/Supplier']),
        new Filter("company_group", this.company_group),
        ...(this.year !== 'latest' ? [new Filter('year', this.year)] : [])
      ])

    const incidents_remediation = this.dataProvider.getAnswers(incidents_remediation_metric,
      [
        // new Filter("year", this.year),
        new Filter("value", ['Worker remediation']),
        new Filter("company_group", this.company_group),
        ...(this.year !== 'latest' ? [new Filter('year', this.year)] : [])
      ])

    const due_dilligence = this.dataProvider.getAnswers(due_dilligence_metric,
      [
        // new Filter("year", this.year),
        new Filter("value", ['Yes']),
        new Filter("company_group", this.company_group),
        ...(this.year !== 'latest' ? [new Filter('year', this.year)] : [])
      ])

    const msa_incidents = this.dataProvider.getAnswers(incidents_metric,
      [
        // new Filter("year", this.year),
        new Filter("value", ['Yes']),
        new Filter("company_group", this.company_group),
        ...(this.year !== 'latest' ? [new Filter('year', this.year)] : [])
      ])


    /**perform the requests using forkJoin to get all the results before start calculating the key findings**/
    forkJoin([assessed, meet_requirements, supply_chain_disclosure, incidents_remediation, due_dilligence, msa_incidents])
      .pipe(map(([assessed_response, meet_requirements_response, supply_chain_disclosure_response, incidents_remediation_response, due_dilligence_response, msa_incidents_response]) => {
        if (this.year == 'latest') {
          assessed_response = Object.values(assessed_response.reduce((r: any, o: any) => {
            r[o.company] = (r[o.company] && r[o.company].year > o.year) ? r[o.company] : o

            return r
          }, {}))
        }
        meet_requirements_response = meet_requirements_response.filter((item: any) => assessed_response.find((o: any) => o.company == item.company && o.year == item.year))
        supply_chain_disclosure_response = supply_chain_disclosure_response.filter((item: any) => assessed_response.find((o: any) => o.company == item.company && o.year == item.year))
        incidents_remediation_response = incidents_remediation_response.filter((item: any) => assessed_response.find((o: any) => o.company == item.company && o.year == item.year))
        due_dilligence_response = due_dilligence_response.filter((item: any) => assessed_response.find((o: any) => o.company == item.company && o.year == item.year))
        msa_incidents_response = msa_incidents_response.filter((item: any) => assessed_response.find((o: any) => o.company == item.company && o.year == item.year))

        return {
          'num_of_assessed_msa_statements': assessed_response.length,
          'cover_min_requirements': Math.round((meet_requirements_response.length / assessed_response.length) * 100),
          'supply_chain_disclosure': Math.round((supply_chain_disclosure_response.length) * 100 / assessed_response.length),
          'incidents_remediation': Math.round((incidents_remediation_response.length) * 100 / assessed_response.length),
          'due_dilligence': Math.round((due_dilligence_response.length) * 100 / assessed_response.length),
        }
      }))
      .subscribe({
        next: (results) => {
          this.numOfAssessedMSAStatements = results.num_of_assessed_msa_statements
          this.meetsMinRequirements = results.cover_min_requirements
          this.supplyChainDisclosure = results.supply_chain_disclosure
          this.workerRemediation = results.incidents_remediation
          this.dueDilligence = results.due_dilligence
          // this.incidents = results.incidents

          this.drawDonutChart(100 - this.meetsMinRequirements, "donut-meet-min-requirements", this.meet_min_requirements_metric_url, ['Do not meet minimum requirements', 'Meet minimum requirements'], "#FF5C45")
          this.drawDonutChart(100 - this.supplyChainDisclosure, "donut-supply-chain-disclosure", this.supply_chain_disclosure_url, ['Do not disclose information about their supply chain', 'Disclose information about their supply chain'], "#FF5C45")
          this.drawDonutChart(100 - this.workerRemediation, "donut-worker-remediation", this.worker_remediation_url, ['Disclose direct worker remediation policies', 'Do not disclose direct worker remediation policies'], "#FF5C45")
          this.drawDonutChart(100 - this.dueDilligence, "donut-due-dilligence", this.due_dilligence_url, ['No supply chain due dilligence in place', 'Supply chain due dilligence in place'], "#FF5C45")
          // this.drawDonutChart(this.incidents, "donut-incidents", this.incidents_url, "#FF5C45")

          //loading stops when all requests and calculations have been performed successfully
        },
        complete: () => {
          this.isLoading = false
        }
      })
  }

  openMessage() {
    this.modalService.open(this.content, { centered: true });
  }

  drawDonutChart(percentage: number, elementId: string, url: string, options: string[], hex: string) {
    this.chartsService.drawDonutChart(
      `${percentage}%`,
      `div#${elementId}`,
      [{
        'id': options[0],
        'percent': percentage,
        'URL': url
      },
      {
        'id': options[1],
        'percent': 100 - percentage,
        'URL': url
      }],
      250, 250, ["#e5e5ea", hex],
      [options[1], options[0]], { renderer: "svg", actions: false })
  }
}
