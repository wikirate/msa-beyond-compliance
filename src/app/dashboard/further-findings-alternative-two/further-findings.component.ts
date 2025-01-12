import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Filter } from "../../models/filter.model";
import { DataProvider } from "../../services/data.provider";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { SectorProvider } from "../../services/sector.provider";
import { forkJoin } from "rxjs";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'further-findings',
  templateUrl: './further-findings.component.html',
  styleUrls: ['./further-findings.component.scss']
})
export class FurtherFindingsComponent implements OnInit {
  sector: string = "all-sectors";
  legislation: string = 'both';
  year: string = ''
  percentage_of_companies_identified_risks: number = 0;
  percentage_of_companies_report_policy_beyond_t1: number = 0;
  percentage_of_no_remediations: number = 0;
  @ViewChild("content") content!: TemplateRef<any>;

  isLoading: boolean = true;

  constructor(private dataProvider: DataProvider, private route: ActivatedRoute, private sectorProvider: SectorProvider, private modalService: NgbModal) {
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params: ParamMap) => {
      let sector = params.get('sector');
      if (sector !== null) {
        this.sector = sector
        this.updateData()
      }
      this.sectorProvider.getSector().next(sector);
    }
    )
    this.route.url.subscribe(val => {
      if (val[1].path === 'further-findings')
        this.sectorProvider.getPath().next(val[1].path)
    })
  }

  getSectorName(): any {
    return (this.dataProvider.sectors as any)[this.sector]
  }


  updateData() {
    this.isLoading = true
    let company_group: any = []
    if (this.sector != 'all-sectors')
      company_group.push(this.dataProvider.getCompanyGroup(this.sector))
    this.isLoading = true;
    let assessed_statements_metric_id = this.dataProvider.metrics.msa_meet_min_requirements
    company_group.push(this.dataProvider.companies_with_assessed_statement.any)
    if (this.legislation == 'uk') {
      assessed_statements_metric_id = this.dataProvider.metrics.meet_uk_min_requirements
      company_group.push(this.dataProvider.companies_with_assessed_statement.uk)
    } else if (this.legislation == 'aus') {
      if (this.year !== '' && this.year !== 'latest' && Number(this.year) < 2020) {
        this.openMessage();
        this.year = '2020';
      }
      assessed_statements_metric_id = this.dataProvider.metrics.meet_aus_min_requirements
      company_group.push(this.dataProvider.companies_with_assessed_statement.aus)
    }

    this.isLoading = true

    let assessed_filters = [
      new Filter("year", this.year),
      new Filter("value", ["Yes", "No", "Unknown"]),
      new Filter("company_group", company_group)
    ]
    if (this.year == 'latest') {
      assessed_filters = [
        new Filter("value", ["Yes", "No", "Unknown"]),
        new Filter("company_group", company_group)
      ]
    }

    let assessed_statements = this.dataProvider.getAnswers(assessed_statements_metric_id, assessed_filters)

    let no_remediation = this.dataProvider.getAnswers(this.dataProvider.metrics.msa_incidents_remediation,
      [new Filter("year", this.year),
      new Filter("value", ["No", "In Development"]),
      new Filter("company_group", company_group)])

    let risks_identified = this.dataProvider.getAnswers(this.dataProvider.metrics.msa_risks_identified,
      [new Filter("year", this.year),
      new Filter("value", ["Yes"]),
      new Filter("company_group", company_group)])

    let policy_beyond_t1 = this.dataProvider.getAnswers(this.dataProvider.metrics.msa_policy_beyond_t1,
      [new Filter("year", this.year),
      new Filter("value", ["Yes"]),
      new Filter("company_group", company_group)])

    forkJoin([assessed_statements, no_remediation, risks_identified, policy_beyond_t1]).subscribe(response => {
      if (this.year == 'latest') {
        response[0] = Object.values(response[0].reduce((r: any, o: any) => {
          r[o.company] = (r[o.company] && r[o.company].year > o.year) ? r[o.company] : o
          return r
        }, {}))
      }
      response[1] = response[1].filter((item: any) => response[0].find((o: any) => o.company == item.company && o.year == item.year))
      response[2] = response[2].filter((item: any) => response[0].find((o: any) => o.company == item.company && o.year == item.year))
      response[3] = response[3].filter((item: any) => response[0].find((o: any) => o.company == item.company && o.year == item.year))

      let assessed = response[0]
      let no_remediation = response[1]
      let reported_risks = response[2]
      let policy_beyond = response[3]

      this.percentage_of_no_remediations = Math.round(no_remediation.length * 100 / assessed.length);
      this.percentage_of_companies_identified_risks = Math.round(reported_risks.length * 100 / assessed.length);
      this.percentage_of_companies_report_policy_beyond_t1 = Math.round(policy_beyond.length * 100 / assessed.length);
    }, error => {
      console.log(error)
    }, () => this.isLoading = false)

  }

  openMessage() {
    this.modalService.open(this.content, { centered: true });
  }
}
