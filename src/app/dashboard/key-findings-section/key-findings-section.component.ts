import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {DataProvider} from "../../services/data.provider";
import {Filter} from "../../models/filter.model";
import {ValueRange} from "../../models/valuerange.model";

@Component({
  selector: 'key-findings-section',
  templateUrl: './key-findings-section.component.html',
  styleUrls: ['./key-findings-section.component.scss']
})
export class KeyFindingsSectionComponent implements OnInit, OnChanges {

  @Input()
  sector !: string;
  numOfCompaniesUnderMSA!: number;
  numOfAssessedMSAStatements!: number;
  meetsMinRequirements!: number;
  go_beyond_compliance!: number;

  year: number | string = ''
  legislation: string = 'both'
  isLoading: boolean = true;

  constructor(private dataProvider: DataProvider) {
  }

  ngOnInit(): void {
  }

  ngOnChanges(): void {
    this.updateData()
  }

  updateData() {
    let company_group = this.dataProvider.getCompanyGroup(this.sector)
    this.isLoading = true;
    this.numOfAssessedMSAStatements = 0;
    if (this.legislation === 'both') {
      this.dataProvider.getAnswers(this.dataProvider.metrics.modern_slavery_statement,
        [new Filter("year", this.year), new Filter("company_group", company_group), new Filter("value", ["Yes - UK Modern Slavery Act", "Yes - Australian Modern Slavery Act"])]).subscribe(data => {
        this.numOfCompaniesUnderMSA = data.length
        this.dataProvider.getAnswers(this.dataProvider.metrics.aus_msa_statement_assessed,
          [new Filter("year", this.year), new Filter("value", "Yes"), new Filter("company_group", company_group)]).subscribe(aus_assessed => {
          this.dataProvider.getAnswers(this.dataProvider.metrics.uk_msa_statement_assessed,
            [new Filter("year", this.year), new Filter("value", "Yes"), new Filter("company_group", company_group)]).subscribe(uk_assessed => {
            let assessed = [...new Set([...aus_assessed, ...uk_assessed])];
            assessed = assessed.filter((arr, index, self) =>
              index === self.findIndex((t) => (t.company === arr.company && t.year === arr.year)))
            this.numOfAssessedMSAStatements = assessed.length
            this.dataProvider.getAnswers(this.dataProvider.metrics.meet_aus_min_requirements,
              [new Filter("year", this.year), new Filter("value", "Yes"), new Filter("company_group", company_group)]).subscribe(data => {
              this.meetsMinRequirements = data.length
              this.dataProvider.getAnswers(this.dataProvider.metrics.meet_uk_min_requirements,
                [new Filter("year", this.year), new Filter("value", "Yes"), new Filter("company_group", company_group)]).subscribe(data => {
                this.meetsMinRequirements = Math.round((this.meetsMinRequirements + data.length) * 100 / this.numOfAssessedMSAStatements)
                this.dataProvider.getAnswers(this.dataProvider.metrics.msa_beyond_compliance,
                  [new Filter("year", this.year), new Filter("value", "Yes"), new Filter("company_group", company_group)]).subscribe(beyond_compliance => {
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
      })
    } else if (this.legislation === 'uk') {
      this.dataProvider.getAnswers(this.dataProvider.metrics.modern_slavery_statement,
        [new Filter("year", this.year), new Filter("value", ["Yes - UK Modern Slavery Act"]), new Filter("company_group", company_group)]).subscribe(data => {
        this.numOfCompaniesUnderMSA = data.length
        this.dataProvider.getAnswers(this.dataProvider.metrics.uk_msa_statement_assessed,
          [new Filter("year", this.year), new Filter("value", "Yes"), new Filter("company_group", company_group)]).subscribe(assessed => {
          this.numOfAssessedMSAStatements = assessed.length
          this.dataProvider.getAnswers(this.dataProvider.metrics.meet_uk_min_requirements,
            [new Filter("year", this.year), new Filter("value", "Yes"), new Filter("company_group", company_group)]).subscribe(data => {
            this.meetsMinRequirements = Math.round(((data.length / this.numOfAssessedMSAStatements) * 100))
            this.dataProvider.getAnswers(this.dataProvider.metrics.uk_beyond_compliance_disclosure_rate,
              [new Filter("year", this.year), new Filter("value", new ValueRange(1, '')), new Filter("company_group", company_group)]).subscribe(beyond_compliance => {
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
    } else {
      // console.log(this.year)
      // if (this.year!=='' && this.year !== 'latest' && Number(this.year) < 2020) {
      //   this.year = 2020
      // }
      this.dataProvider.getAnswers(this.dataProvider.metrics.modern_slavery_statement,
        [new Filter("year", this.year), new Filter("value", ["Yes - Australian Modern Slavery Act"]), new Filter("company_group", company_group)]).subscribe(data => {
        this.numOfCompaniesUnderMSA = data.length
        this.dataProvider.getAnswers(this.dataProvider.metrics.aus_msa_statement_assessed,
          [new Filter("year", this.year), new Filter("value", "Yes"), new Filter("company_group", company_group)]).subscribe(assessed => {
          this.numOfAssessedMSAStatements = assessed.length
          this.dataProvider.getAnswers(this.dataProvider.metrics.meet_aus_min_requirements,
            [new Filter("year", this.year), new Filter("value", "Yes"), new Filter("company_group", company_group)]).subscribe(data => {
            this.meetsMinRequirements = Math.round((data.length / this.numOfAssessedMSAStatements) * 100)
            this.dataProvider.getAnswers(this.dataProvider.metrics.aus_beyond_compliance_disclosure_rate,
              [new Filter("year", this.year), new Filter("value", new ValueRange(1, '')), new Filter("company_group", company_group)]).subscribe(beyond_compliance => {
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
    }
  }
}
