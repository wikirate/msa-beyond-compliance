import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {Filter} from "../../models/filter.model";
import {DataProvider} from "../../services/data.provider";

@Component({
  selector: 'further-findings-alt-two',
  templateUrl: './further-findings.component.html',
  styleUrls: ['./further-findings.component.scss']
})
export class FurtherFindingsAltTwoComponent implements OnInit {
  @Input()
  sector !: string;
  year: number | string = ''
  percentage_of_companies_identified_incidents: number = 0;
  percentage_of_companies_report_policy_beyond_t1: number = 0;
  percentage_of_companies_identified_risks: number = 0;

  isLoading: boolean = true;

  constructor(private dataProvider: DataProvider) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.updateData()
  }

  ngOnInit(): void {
  }

  updateData() {
    let company_group = this.dataProvider.getCompanyGroup(this.sector)
    this.isLoading = true
    this.dataProvider.getAnswers(this.dataProvider.metrics.msa_statement_assessed,
      [new Filter("year", this.year), new Filter("value", "Yes"), new Filter("company_group", company_group)]).subscribe(assessed => {
      this.dataProvider.getAnswers(1831964,
        [new Filter("year", this.year), new Filter("value", "Yes"), new Filter("company_group", company_group)]).subscribe(reported_incidents => {
        // @ts-ignore
        reported_incidents = reported_incidents.filter((a: { company: any; year: any; }) => assessed.some(statement => statement.company == a.company && statement.year == a.year))
        this.percentage_of_companies_identified_incidents = Math.round(reported_incidents.length * 100 / assessed.length);
        this.dataProvider.getAnswers(6916242,
          [new Filter("year", this.year), new Filter("value", "Yes"), new Filter("company_group", company_group)]).subscribe(reported_risks => {
          // @ts-ignore
          reported_risks = reported_risks.filter((a: { company: any; year: any; }) => assessed.some(statement => statement.company == a.company && statement.year == a.year))
          this.percentage_of_companies_identified_risks = Math.round(reported_risks.length * 100 / assessed.length);
          this.dataProvider.getAnswers(6915846,
            [new Filter("year", this.year), new Filter("value", "Yes"), new Filter("company_group", company_group)]).subscribe(beyond_t1 => {
            // @ts-ignore
            beyond_t1 = beyond_t1.filter((a: { company: any; year: any; }) => assessed.some(statement => statement.company == a.company && statement.year == a.year))
            this.percentage_of_companies_report_policy_beyond_t1 = Math.round(beyond_t1.length * 100 / assessed.length);
          })
        })
      }, error => {
        console.log(error)
      }, () => this.isLoading = false)
    })
  }
}
