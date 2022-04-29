import {Component, OnInit} from '@angular/core';
import {Filter} from "../../models/filter.model";
import {DataProvider} from "../../services/data.provider";

@Component({
  selector: 'further-findings',
  templateUrl: './further-findings.component.html',
  styleUrls: ['./further-findings.component.scss']
})
export class FurtherFindingsComponent implements OnInit {
  year: number | string = 'latest'
  percentage_of_companies_identified_incidents: number = 0;
  percentage_of_companies_report_policy_beyond_t1: number = 0;
  percentage_of_companies_identified_risks: number = 0;

  isLoading: boolean = true;

  constructor(private dataProvider: DataProvider) {
  }

  ngOnInit(): void {
    this.updateData();
  }

  updateData() {
    this.isLoading = true
    this.dataProvider.getAnswers(this.dataProvider.metrics.aus_msa_statement_assessed,
      [new Filter("year", this.year), new Filter("value", "Yes")]).subscribe(aus_assessed => {
      // @ts-ignore
      let assessed_aus_companies = aus_assessed.map(a => {
        return a['company'];
      });
      this.dataProvider.getAnswers(this.dataProvider.metrics.uk_msa_statement_assessed,
        [new Filter("year", this.year), new Filter("value", "Yes")]).subscribe(uk_assessed => {
        // @ts-ignore
        let assessed = [...new Set([...assessed_aus_companies, ...uk_assessed.map(a => {
          return a['company'];
        })])];
        this.dataProvider.getAnswers(1831964,
          [new Filter("year", this.year), new Filter("value", "Yes")]).subscribe(reported_incidents => {
          // @ts-ignore
          reported_incidents = reported_incidents.filter(a => assessed.includes(a['company']))
          this.percentage_of_companies_identified_incidents = Math.round(reported_incidents.length * 100 / assessed.length);
          this.dataProvider.getAnswers(6916242,
            [new Filter("year", this.year), new Filter("value", "Yes")]).subscribe(reported_risks => {
            // @ts-ignore
            reported_risks = reported_risks.filter(a => assessed.includes(a['company']))
            this.percentage_of_companies_identified_risks = Math.round(reported_risks.length * 100 / assessed.length);
            this.dataProvider.getAnswers(6915846,
              [new Filter("year", this.year), new Filter("value", "Yes")]).subscribe(beyond_t1 => {
              // @ts-ignore
              beyond_t1 = beyond_t1.filter(a => assessed.includes(a['company']))
              this.percentage_of_companies_report_policy_beyond_t1 = Math.round(beyond_t1.length * 100 / assessed.length);
            })
          })
        }, error => {
          console.log(error)
        }, () => this.isLoading = false)
      })
    })
  }
}
