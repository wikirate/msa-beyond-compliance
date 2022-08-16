import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {DataProvider} from "../../services/data.provider";
import {Filter} from "../../models/filter.model";
import {ValueRange} from "../../models/valuerange.model";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {ActivatedRoute, ParamMap} from "@angular/router";
import {SectorProvider} from "../../services/sector.provider";
import {Meta, Title} from "@angular/platform-browser";

@Component({
  selector: 'key-findings-section',
  templateUrl: './key-findings-section.component.html',
  styleUrls: ['./key-findings-section.component.scss']
})
export class KeyFindingsSectionComponent implements OnInit {
  sector: string = "all-sectors";
  company_group: string = ""
  @ViewChild("content") content!: TemplateRef<any>;

  numOfCompaniesUnderMSA!: number;
  numOfAssessedMSAStatements!: number;
  meetsMinRequirements!: number;
  go_beyond_compliance!: number;

  year: number | string = ''
  legislation: string = 'both'
  isLoading: boolean = true;

  legislation_filter: string = '&filter[value][]=Yes - UK Modern Slavery Act&filter[value][]=Yes - Australian Modern Slavery Act'
  beyond_compliance_metric = '#'
  meet_min_req_metric: string = '#'
  msa_statement_assessed_metric: string = '#'

  constructor(private dataProvider: DataProvider, private modalService: NgbModal,
              private route: ActivatedRoute, private sectorProvider: SectorProvider,
              private titleService: Title, private meta: Meta) {

  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params: ParamMap) => {
        let sector = params.get('sector');
        if (sector !== null) {
          this.sector = sector
          this.company_group = this.dataProvider.getCompanyGroup(this.sector)
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

  updateData($event: any) {
    this.isLoading = true;
    this.numOfAssessedMSAStatements = 0;
    if (this.legislation === 'both') {
      this.beyond_compliance_metric = 'https://wikirate.org/Walk_Free+MSA_Beyond_Compliance?filter[value]=Yes&filter[company_group]=' + this.company_group + '&filter[year]=' + this.year
      this.legislation_filter = "&filter[value][]=Yes - UK Modern Slavery Act&filter[value][]=Yes - Australian Modern Slavery Act"
      this.meet_min_req_metric = 'https://wikirate.org/Walk_Free+Meets_Minimum_MSA_Requirements?filter[value]=Yes&filter[company_group]=' + this.company_group + '&filter[year]=' + this.year
      this.msa_statement_assessed_metric = 'MSA_statement_assessed'
      this.dataProvider.getAnswers(this.dataProvider.metrics.modern_slavery_statement,
        [new Filter("year", this.year), new Filter("company_group", this.company_group), new Filter("value", ["Yes - UK Modern Slavery Act", "Yes - Australian Modern Slavery Act"])]).subscribe(data => {
        this.numOfCompaniesUnderMSA = data.length
        this.dataProvider.getAnswers(this.dataProvider.metrics.msa_statement_assessed,
          [new Filter("year", this.year), new Filter("value", "Yes"), new Filter("company_group", this.company_group)]).subscribe(assessed => {
          this.numOfAssessedMSAStatements = assessed.length
          this.dataProvider.getAnswers(this.dataProvider.metrics.meet_aus_min_requirements,
            [new Filter("year", this.year), new Filter("value", "Yes"), new Filter("company_group", this.company_group)]).subscribe(meets_uk_min_requirements => {
            meets_uk_min_requirements = meets_uk_min_requirements.filter((item: { year: number, company: number }) => {
              return assessed.findIndex((a: any) => {
                return a.company == item.company && a.year == item.year
              }) >= 0
            })
            this.meetsMinRequirements = meets_uk_min_requirements.length
            this.dataProvider.getAnswers(this.dataProvider.metrics.meet_uk_min_requirements,
              [new Filter("year", this.year), new Filter("value", "Yes"), new Filter("company_group", this.company_group)]).subscribe(meets_aus_min_requirements => {
              meets_aus_min_requirements = meets_aus_min_requirements.filter((item: { year: number, company: number }) => {
                return assessed.findIndex((a: any) => {
                  return a.company == item.company && a.year == item.year
                }) >= 0 && meets_uk_min_requirements.findIndex((a: any) => {
                  return a.company == item.company && a.year == item.year
                }) < 0
              })
              this.meetsMinRequirements = Math.round((this.meetsMinRequirements + meets_aus_min_requirements.length) * 100 / this.numOfAssessedMSAStatements)
              this.dataProvider.getAnswers(this.dataProvider.metrics.msa_beyond_compliance,
                [new Filter("year", this.year), new Filter("value", "Yes"), new Filter("company_group", this.company_group)]).subscribe(beyond_compliance => {
                beyond_compliance = beyond_compliance.filter((item: { year: number, company: number }) => {
                  return assessed.findIndex((a: any) => {
                    return a.company == item.company && a.year == item.year
                  }) >= 0
                })
                this.go_beyond_compliance = Math.round((beyond_compliance.length) * 100 / this.numOfAssessedMSAStatements)
              }, (error) => console.log(error), () => this.isLoading = false)
            })
          })
        })
      })
      return $event;
    } else if (this.legislation === 'uk') {
      this.msa_statement_assessed_metric = 'UK_MSA_statement_assessed'
      this.meet_min_req_metric = 'https://wikirate.org/Walk_Free+Meets_Minimum_UK_MSA_Requirements?filter[value]=Yes&filter[company_group]=' + this.company_group + '&filter[year]=' + this.year
      this.beyond_compliance_metric = 'https://wikirate.org/Walk_Free+UK_MSA_Beyond_Compliance_Disclosure_Rate?&filter[company_group]=' + this.company_group + '&filter[year]=' + this.year + "&filter[value][from]=0"
      this.legislation_filter = "&filter[value][]=Yes - UK Modern Slavery Act"
      this.dataProvider.getAnswers(this.dataProvider.metrics.modern_slavery_statement,
        [new Filter("year", this.year), new Filter("value", ["Yes - UK Modern Slavery Act"]), new Filter("company_group", this.company_group)]).subscribe(data => {
        this.numOfCompaniesUnderMSA = data.length
        this.dataProvider.getAnswers(this.dataProvider.metrics.uk_msa_statement_assessed,
          [new Filter("year", this.year), new Filter("value", "Yes"), new Filter("company_group", this.company_group)]).subscribe(assessed => {
          this.numOfAssessedMSAStatements = assessed.length
          this.dataProvider.getAnswers(this.dataProvider.metrics.meet_uk_min_requirements,
            [new Filter("year", this.year), new Filter("value", "Yes"), new Filter("company_group", this.company_group)]).subscribe(meets_min_requirements => {
            meets_min_requirements = meets_min_requirements.filter((item: { year: number, company: number }) => {
              return assessed.findIndex((a: any) => {
                return a.company == item.company && a.year == item.year
              }) >= 0
            })
            this.meetsMinRequirements = Math.round((meets_min_requirements.length / this.numOfAssessedMSAStatements) * 100)
            this.dataProvider.getAnswers(this.dataProvider.metrics.uk_beyond_compliance_disclosure_rate,
              [new Filter("year", this.year), new Filter("value", new ValueRange(1, '')), new Filter("company_group", this.company_group)]).subscribe(beyond_compliance => {
              beyond_compliance = beyond_compliance.filter((item: { year: number, company: number }) => {
                return assessed.findIndex((a: any) => {
                  return a.company == item.company && a.year == item.year
                }) >= 0
              })
              this.go_beyond_compliance = Math.round((beyond_compliance.length) * 100 / this.numOfAssessedMSAStatements)
            }, (error) => console.log(error), () => this.isLoading = false)
          })
        })
      })
      return $event;
    } else {
      this.msa_statement_assessed_metric = 'Australian_MSA_statement_assessed'
      this.meet_min_req_metric = 'https://wikirate.org/Walk_Free+Meets_Minimum_Australian_MSA_Requirements?filter[value]=Yes&filter[company_group]=' + this.company_group + '&filter[year]=' + this.year
      this.beyond_compliance_metric = 'https://wikirate.org/Walk_Free+AUS_MSA_Beyond_Compliance_Disclosure_Rate?filter[company_group]=' + this.company_group + '&filter[year]=' + this.year + "&filter[value][from]=0"
      this.legislation_filter = "&filter[value][]=Yes - Australian Modern Slavery Act"
      if (this.year !== '' && this.year !== 'latest' && Number(this.year) < 2020) {
        this.openMessage();
        this.year = 2020;
      }
      this.dataProvider.getAnswers(this.dataProvider.metrics.modern_slavery_statement,
        [new Filter("year", this.year), new Filter("value", ["Yes - Australian Modern Slavery Act"]), new Filter("company_group", this.company_group)]).subscribe(data => {
        this.numOfCompaniesUnderMSA = data.length
        this.dataProvider.getAnswers(this.dataProvider.metrics.aus_msa_statement_assessed,
          [new Filter("year", this.year), new Filter("value", "Yes"), new Filter("company_group", this.company_group)]).subscribe(assessed => {
          this.numOfAssessedMSAStatements = assessed.length
          this.dataProvider.getAnswers(this.dataProvider.metrics.meet_aus_min_requirements,
            [new Filter("year", this.year), new Filter("value", "Yes"), new Filter("company_group", this.company_group)]).subscribe(meets_min_requirements => {
            meets_min_requirements = meets_min_requirements.filter((item: { year: number, company: number }) => {
              return assessed.findIndex((a: any) => {
                return a.company == item.company && a.year == item.year
              }) >= 0
            })
            this.meetsMinRequirements = Math.round((meets_min_requirements.length / this.numOfAssessedMSAStatements) * 100)
            this.dataProvider.getAnswers(this.dataProvider.metrics.aus_beyond_compliance_disclosure_rate,
              [new Filter("year", this.year), new Filter("value", new ValueRange(1, '')), new Filter("company_group", this.company_group)]).subscribe(beyond_compliance => {
              beyond_compliance = beyond_compliance.filter((item: { year: number, company: number }) => {
                return assessed.findIndex((a: any) => {
                  return a.company == item.company && a.year == item.year
                }) >= 0
              })
              this.go_beyond_compliance = Math.round((beyond_compliance.length) * 100 / this.numOfAssessedMSAStatements)
            }, (error) => console.log(error), () => this.isLoading = false)
          })
        })
      })
      return this.year;
    }
  }

  openMessage() {
    this.modalService.open(this.content, {centered: true});
  }
}
