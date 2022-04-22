import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {DataProvider} from "../../services/data.provider";
import {Filter} from "../../models/filter.model";

@Component({
  selector: 'key-findings-section',
  templateUrl: './key-findings-section.component.html',
  styleUrls: ['./key-findings-section.component.scss']
})
export class KeyFindingsSectionComponent implements OnInit, OnChanges {

  @Input()
  sector!: string;
  numOfCompaniesUnderMSA!: number;
  numOfAssessedMSAStatements!: number;
  meetsMinRequirements!: number;

  year: number | string = 'latest'
  legislation: string = 'both'
  isLoading: boolean = true;

  constructor(private dataProvider: DataProvider) {
  }

  ngOnInit(): void {
    this.updateData()
  }

  ngOnChanges(): void {
  }

  updateData() {
    this.isLoading = true;
    if (this.legislation === 'both') {
      this.dataProvider.getAnswers(this.dataProvider.metrics.msa_registry_submission,
        [new Filter("year", this.year)]).subscribe(data => {
        this.numOfCompaniesUnderMSA = data.length
        this.dataProvider.getAnswers(this.dataProvider.metrics.aus_msa_statement_assessed,
          [new Filter("year", this.year), new Filter("value", "Yes")]).subscribe(data => {
          this.numOfAssessedMSAStatements = data.length
          this.dataProvider.getAnswers(this.dataProvider.metrics.uk_msa_statement_assessed,
            [new Filter("year", this.year), new Filter("value", "Yes")]).subscribe(data => {
            this.numOfAssessedMSAStatements += data.length
            this.dataProvider.getAnswers(this.dataProvider.metrics.meet_aus_min_requirements,
              [new Filter("year", this.year), new Filter("value", "Yes")]).subscribe(data => {
              this.meetsMinRequirements = data.length
              this.dataProvider.getAnswers(this.dataProvider.metrics.meet_uk_min_requirements,
                [new Filter("year", this.year), new Filter("value", "Yes")]).subscribe(data => {
                this.meetsMinRequirements = Math.round(((this.meetsMinRequirements + data.length) * 100 / this.numOfAssessedMSAStatements) * 100) / 100
              }, (error) => console.log(error), () => this.isLoading = false)
            })
          })
        })
      })


    } else if (this.legislation === 'uk') {
      this.dataProvider.getAnswers(this.dataProvider.metrics.msa_registry_submission,
        [new Filter("year", this.year), new Filter('value', 'UK Registry Submission')]).subscribe(data => {
        this.numOfCompaniesUnderMSA = data.length
        this.dataProvider.getAnswers(this.dataProvider.metrics.uk_msa_statement_assessed,
          [new Filter("year", this.year), new Filter("value", "Yes")]).subscribe(data => {
          this.numOfAssessedMSAStatements = data.length
          this.dataProvider.getAnswers(this.dataProvider.metrics.meet_uk_min_requirements,
            [new Filter("year", this.year), new Filter("value", "Yes")]).subscribe(data => {
            this.meetsMinRequirements = Math.round(((data.length / this.numOfAssessedMSAStatements) * 100) * 100) / 100
          }, (error) => console.log(error), () => this.isLoading = false)
        })
      })


    } else {
      this.dataProvider.getAnswers(this.dataProvider.metrics.msa_registry_submission,
        [new Filter("year", this.year), new Filter('value', 'Australian Registry Submission')]).subscribe(data => {
        this.numOfCompaniesUnderMSA = data.length
        this.dataProvider.getAnswers(this.dataProvider.metrics.aus_msa_statement_assessed,
          [new Filter("year", this.year), new Filter("value", "Yes")]).subscribe(data => {
          this.numOfAssessedMSAStatements = data.length
          this.dataProvider.getAnswers(this.dataProvider.metrics.meet_aus_min_requirements,
            [new Filter("year", this.year), new Filter("value", "Yes")]).subscribe(data => {
            this.meetsMinRequirements = Math.round(((data.length / this.numOfAssessedMSAStatements) * 100) * 100) / 100
          }, (error) => console.log(error), () => this.isLoading = false)
        })
      })
    }
  }
}
