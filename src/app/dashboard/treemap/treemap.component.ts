import {Component, Input, OnInit} from '@angular/core';
import {DataProvider} from "../../services/data.provider";
import {Filter} from "../../models/filter.model";
import {stringify} from "@angular/compiler/src/util";
import {ChartsService} from "../../services/charts.service";

@Component({
  selector: 'treemap',
  templateUrl: './treemap.component.html',
  styleUrls: ['./treemap.component.scss']
})
export class TreemapComponent implements OnInit {
  @Input()
  sector!: string;
  year: number | string = '';
  legislation: string = 'both';
  isLoading: boolean = true;

  constructor(private dataProvider: DataProvider, private chartService: ChartsService) {
  }

  ngOnInit(): void {
    this.updateData()
  }

  updateData() {

    if (this.legislation == 'both') {
      this.isLoading = true;
      let meet_min_requirements_garment = 0;
      let meet_min_requirements_financial = 0;
      let meet_min_requirements_hospitality = 0;
      let meet_min_requirements_other = 0;
      this.dataProvider.getAnswers(this.dataProvider.metrics.msa_statement_assessed, [new Filter("year", this.year), new Filter("value", "Yes")]).subscribe(assessed => {
        this.dataProvider.getAnswers(this.dataProvider.metrics.msa_statement_assessed, [new Filter("year", this.year), new Filter("company_group", "MSA Garment"), new Filter("value", "Yes")]).subscribe(garment_assessed_statements => {
          this.dataProvider.getAnswers(this.dataProvider.metrics.msa_statement_assessed, [new Filter("year", this.year), new Filter("company_group", "MSA Financial"), new Filter("value", "Yes")]).subscribe(financial_assessed_statements => {
            this.dataProvider.getAnswers(this.dataProvider.metrics.msa_statement_assessed, [new Filter("year", this.year), new Filter("company_group", "MSA Hospitality"), new Filter("value", "Yes")]).subscribe(hospitality_assessed_statements => {
              this.dataProvider.getAnswers(this.dataProvider.metrics.meet_uk_min_requirements, [new Filter("year", this.year), new Filter("value", "Yes")]).subscribe(meet_uk_min_requirements => {
                this.dataProvider.getAnswers(this.dataProvider.metrics.meet_aus_min_requirements, [new Filter("year", this.year), new Filter("value", "Yes")]).subscribe(meet_aus_min_requirements => {
                  for (let statement of assessed) {
                    if ((meet_uk_min_requirements.findIndex((s: { company: any; year: any; }) => s.company === statement.company && s.year === statement.year
                    ) >= 0 || meet_aus_min_requirements.findIndex((s: { company: any; year: any; }) => s.company === statement.company && s.year === statement.year
                    ) >= 0) && garment_assessed_statements.findIndex((s: { company: any; year: any; }) => s.company === statement.company && s.year === statement.year
                    ) >= 0) {
                      meet_min_requirements_garment++;
                    } else if ((meet_uk_min_requirements.findIndex((s: { company: any; year: any; }) => s.company === statement.company && s.year === statement.year
                    ) >= 0 || meet_aus_min_requirements.findIndex((s: { company: any; year: any; }) => s.company === statement.company && s.year === statement.year
                    ) >= 0) && financial_assessed_statements.findIndex((s: { company: any; year: any; }) => s.company === statement.company && s.year === statement.year
                    ) >= 0) {
                      meet_min_requirements_financial++;
                    } else if ((meet_uk_min_requirements.findIndex((s: { company: any; year: any; }) => s.company === statement.company && s.year === statement.year
                    ) >= 0 || meet_aus_min_requirements.findIndex((s: { company: any; year: any; }) => s.company === statement.company && s.year === statement.year
                    ) >= 0) && hospitality_assessed_statements.findIndex((s: { company: any; year: any; }) => s.company === statement.company && s.year === statement.year
                    ) >= 0) {
                      meet_min_requirements_hospitality++;
                    } else if (meet_uk_min_requirements.findIndex((s: { company: any; year: any; }) => s.company === statement.company && s.year === statement.year
                    ) >= 0 || meet_aus_min_requirements.findIndex((s: { company: any; year: any; }) => s.company === statement.company && s.year === statement.year
                    ) >= 0) {
                      meet_min_requirements_other++;
                    }
                  }

                  let json = [{
                    "name": "Statements",
                    "id": 0
                  }, {
                    "name": "Garment Sector",
                    "id": 1,
                    "parent": 0
                  },
                    {
                      "name": "Financial Sector",
                      "id": 2,
                      "parent": 0
                    },
                    {
                      "name": "Hospitality Sector",
                      "id": 3,
                      "parent": 0
                    },
                    {
                      "name": "Other",
                      "id": 4,
                      "parent": 0
                    },
                    {
                      "id": 5,
                      "name": "Meet Minimum Requirements",
                      "size": meet_min_requirements_garment,
                      "parent": 1
                    },
                    {
                      "id": 6,
                      "name": "Do Not Meet Minimum Requirements",
                      "size": garment_assessed_statements.length - meet_min_requirements_garment,
                      "parent": 1
                    },
                    {
                      "id": 7,
                      "name": "Meet Minimum Requirements",
                      "size": meet_min_requirements_financial,
                      "parent": 2
                    },
                    {
                      "id": 8,
                      "name": "Do Not Meet Minimum Requirements",
                      "size": financial_assessed_statements.length - meet_min_requirements_financial,
                      "parent": 2
                    },
                    {
                      "id": 9,
                      "name": "Meet Minimum Requirements",
                      "size": meet_min_requirements_hospitality,
                      "parent": 3
                    },
                    {
                      "id": 10,
                      "name": "Do Not Meet Minimum Requirements",
                      "size": hospitality_assessed_statements.length - meet_min_requirements_hospitality,
                      "parent": 3
                    },
                    {
                      "id": 11,
                      "name": "Meet Minimum Requirements",
                      "size": meet_min_requirements_other,
                      "parent": 4
                    },
                    {
                      "id": 12,
                      "name": "Do Not Meet Minimum Requirements",
                      "size": (assessed.length - garment_assessed_statements.length - financial_assessed_statements.length - hospitality_assessed_statements.length) - meet_min_requirements_other,
                      "parent": 4
                    }
                  ]
                  console.log(JSON.stringify(json))
                  this.chartService.both_legislations_tree_map(json, "div#tree-map", 0, 0, {
                    renderer: "svg",
                    actions: {source: false, editor: true}
                  }).finally(() => {
                    this.isLoading = false
                  })
                })
              })
            })
          })
        })
      })
    } else if (this.legislation === 'uk') {
      {
        this.isLoading = true;
        let meet_min_requirements_garment_under_36 = 0;
        let meet_min_requirements_garment_36_60 = 0;
        let meet_min_requirements_garment_60_100 = 0;
        let meet_min_requirements_garment_100_500 = 0;
        let meet_min_requirements_garment_over_500 = 0;
        let meet_min_requirements_garment_unknown = 0;

        let does_not_meet_min_requirements_garment_under_36 = 0;
        let does_not_meet_min_requirements_garment_36_60 = 0;
        let does_not_meet_min_requirements_garment_60_100 = 0;
        let does_not_meet_min_requirements_garment_100_500 = 0;
        let does_not_meet_min_requirements_garment_over_500 = 0;
        let does_not_meet_min_requirements_garment_unknown = 0;

        let meet_min_requirements_financial_under_36 = 0;
        let meet_min_requirements_financial_36_60 = 0;
        let meet_min_requirements_financial_60_100 = 0;
        let meet_min_requirements_financial_100_500 = 0;
        let meet_min_requirements_financial_over_500 = 0;
        let meet_min_requirements_financial_unknown = 0;

        let does_not_meet_min_requirements_financial_under_36 = 0;
        let does_not_meet_min_requirements_financial_36_60 = 0;
        let does_not_meet_min_requirements_financial_60_100 = 0;
        let does_not_meet_min_requirements_financial_100_500 = 0;
        let does_not_meet_min_requirements_financial_over_500 = 0;
        let does_not_meet_min_requirements_financial_unknown = 0;

        let meet_min_requirements_hospitality_under_36 = 0;
        let meet_min_requirements_hospitality_36_60 = 0;
        let meet_min_requirements_hospitality_60_100 = 0;
        let meet_min_requirements_hospitality_100_500 = 0;
        let meet_min_requirements_hospitality_over_500 = 0;
        let meet_min_requirements_hospitality_unknown = 0;

        let does_not_meet_min_requirements_hospitality_under_36 = 0;
        let does_not_meet_min_requirements_hospitality_36_60 = 0;
        let does_not_meet_min_requirements_hospitality_60_100 = 0;
        let does_not_meet_min_requirements_hospitality_100_500 = 0;
        let does_not_meet_min_requirements_hospitality_over_500 = 0;
        let does_not_meet_min_requirements_hospitality_unknown = 0;

        let meet_min_requirements_other_under_36 = 0;
        let meet_min_requirements_other_36_60 = 0;
        let meet_min_requirements_other_60_100 = 0;
        let meet_min_requirements_other_100_500 = 0;
        let meet_min_requirements_other_over_500 = 0;
        let meet_min_requirements_other_unknown = 0;

        let does_not_meet_min_requirements_other_under_36 = 0;
        let does_not_meet_min_requirements_other_36_60 = 0;
        let does_not_meet_min_requirements_other_60_100 = 0;
        let does_not_meet_min_requirements_other_100_500 = 0;
        let does_not_meet_min_requirements_other_over_500 = 0;
        let does_not_meet_min_requirements_other_unknown = 0;

        this.dataProvider.getAnswers(this.dataProvider.metrics.msa_statement_assessed, [new Filter("year", this.year), new Filter("value", "Yes")]).subscribe(assessed => {
          this.dataProvider.getAnswers(this.dataProvider.metrics.msa_statement_assessed, [new Filter("year", this.year), new Filter("company_group", "MSA Garment"), new Filter("value", "Yes")]).subscribe(garment_assessed_statements => {
            this.dataProvider.getAnswers(this.dataProvider.metrics.msa_statement_assessed, [new Filter("year", this.year), new Filter("company_group", "MSA Financial"), new Filter("value", "Yes")]).subscribe(financial_assessed_statements => {
              this.dataProvider.getAnswers(this.dataProvider.metrics.msa_statement_assessed, [new Filter("year", this.year), new Filter("company_group", "MSA Hospitality"), new Filter("value", "Yes")]).subscribe(hospitality_assessed_statements => {
                this.dataProvider.getAnswers(this.dataProvider.metrics.meet_uk_min_requirements, [new Filter("year", this.year), new Filter("value", "Yes")]).subscribe(meet_uk_min_requirements => {
                  this.dataProvider.getAnswers(this.dataProvider.metrics.turnover_range, [new Filter("year", 'latest')]).subscribe(turnover_range => {
                    for (let statement of assessed) {
                      let document = turnover_range.find((s: { company: any; }) => s.company === statement.company)
                      if (garment_assessed_statements.findIndex((s: { company: any; year: any; }) => s.company === statement.company && s.year === statement.year
                      ) >= 0) {
                        if (meet_uk_min_requirements.findIndex((s: { company: any; year: any; }) => s.company === statement.company && s.year === statement.year
                        ) >= 0) {
                          if (document !== undefined && document['value'] === "Under £36 million") {
                            meet_min_requirements_garment_under_36++;
                          } else if (document !== undefined && document['value'] === "£36 million to £60 million") {
                            meet_min_requirements_garment_36_60++;
                          } else if (document !== undefined && document['value'] === "£60 million to £100 million") {
                            meet_min_requirements_garment_60_100++;
                          } else if (document !== undefined && document['value'] === "£100 million to £500 million") {
                            meet_min_requirements_garment_100_500++;
                          } else if (document !== undefined && document['value'] === "Over £500 million") {
                            meet_min_requirements_garment_over_500++;
                          } else {
                            meet_min_requirements_garment_unknown++;
                          }
                        } else {
                          if (document !== undefined && document['value'] === "Under £36 million") {
                            does_not_meet_min_requirements_garment_under_36++;
                          } else if (document !== undefined && document['value'] === "£36 million to £60 million") {
                            does_not_meet_min_requirements_garment_36_60++;
                          } else if (document !== undefined && document['value'] === "£60 million to £100 million") {
                            does_not_meet_min_requirements_garment_60_100++;
                          } else if (document !== undefined && document['value'] === "£100 million to £500 million") {
                            does_not_meet_min_requirements_garment_100_500++;
                          } else if (document !== undefined && document['value'] === "Over £500 million") {
                            does_not_meet_min_requirements_garment_over_500++;
                          } else {
                            does_not_meet_min_requirements_garment_unknown++;
                          }
                        }
                      } else if (financial_assessed_statements.findIndex((s: { company: any; year: any; }) => s.company === statement.company && s.year === statement.year
                      ) >= 0) {
                        if (meet_uk_min_requirements.findIndex((s: { company: any; year: any; }) => s.company === statement.company && s.year === statement.year
                        ) >= 0) {
                          if (document !== undefined && document['value'] === "Under £36 million") {
                            meet_min_requirements_financial_under_36++;
                          } else if (document !== undefined && document['value'] === "£36 million to £60 million") {
                            meet_min_requirements_financial_36_60++;
                          } else if (document !== undefined && document['value'] === "£60 million to £100 million") {
                            meet_min_requirements_financial_60_100++;
                          } else if (document !== undefined && document['value'] === "£100 million to £500 million") {
                            meet_min_requirements_financial_100_500++;
                          } else if (document !== undefined && document['value'] === "Over £500 million") {
                            meet_min_requirements_financial_over_500++;
                          } else {
                            meet_min_requirements_financial_unknown++;
                          }
                        } else {
                          if (document !== undefined && document['value'] === "Under £36 million") {
                            does_not_meet_min_requirements_financial_under_36++;
                          } else if (document !== undefined && document['value'] === "£36 million to £60 million") {
                            does_not_meet_min_requirements_financial_36_60++;
                          } else if (document !== undefined && document['value'] === "£60 million to £100 million") {
                            does_not_meet_min_requirements_financial_60_100++;
                          } else if (document !== undefined && document['value'] === "£100 million to £500 million") {
                            does_not_meet_min_requirements_financial_100_500++;
                          } else if (document !== undefined && document['value'] === "Over £500 million") {
                            does_not_meet_min_requirements_financial_over_500++;
                          } else {
                            does_not_meet_min_requirements_financial_unknown++;
                          }
                        }
                      } else if (hospitality_assessed_statements.findIndex((s: { company: any; year: any; }) => s.company === statement.company && s.year === statement.year
                      ) >= 0) {
                        if (meet_uk_min_requirements.findIndex((s: { company: any; year: any; }) => s.company === statement.company && s.year === statement.year
                        ) >= 0) {
                          if (document !== undefined && document['value'] === "Under £36 million") {
                            meet_min_requirements_hospitality_under_36++;
                          } else if (document !== undefined && document['value'] === "£36 million to £60 million") {
                            meet_min_requirements_hospitality_36_60++;
                          } else if (document !== undefined && document['value'] === "£60 million to £100 million") {
                            meet_min_requirements_hospitality_60_100++;
                          } else if (document !== undefined && document['value'] === "£100 million to £500 million") {
                            meet_min_requirements_hospitality_100_500++;
                          } else if (document !== undefined && document['value'] === "Over £500 million") {
                            meet_min_requirements_hospitality_over_500++;
                          } else {
                            meet_min_requirements_hospitality_unknown++;
                          }
                        } else {
                          if (document !== undefined && document['value'] === "Under £36 million") {
                            does_not_meet_min_requirements_hospitality_under_36++;
                          } else if (document !== undefined && document['value'] === "£36 million to £60 million") {
                            does_not_meet_min_requirements_hospitality_36_60++;
                          } else if (document !== undefined && document['value'] === "£60 million to £100 million") {
                            does_not_meet_min_requirements_hospitality_60_100++;
                          } else if (document !== undefined && document['value'] === "£100 million to £500 million") {
                            does_not_meet_min_requirements_hospitality_100_500++;
                          } else if (document !== undefined && document['value'] === "Over £500 million") {
                            does_not_meet_min_requirements_hospitality_over_500++;
                          } else {
                            does_not_meet_min_requirements_hospitality_unknown++;
                          }
                        }
                      } else if (meet_uk_min_requirements.findIndex((s: { company: any; year: any; }) => s.company === statement.company && s.year === statement.year
                      ) >= 0) {
                        if (document !== undefined && document['value'] === "Under £36 million") {
                          meet_min_requirements_other_under_36++;
                        } else if (document !== undefined && document['value'] === "£36 million to £60 million") {
                          meet_min_requirements_other_36_60++;
                        } else if (document !== undefined && document['value'] === "£60 million to £100 million") {
                          meet_min_requirements_other_60_100++;
                        } else if (document !== undefined && document['value'] === "£100 million to £500 million") {
                          meet_min_requirements_other_100_500++;
                        } else if (document !== undefined && document['value'] === "Over £500 million") {
                          meet_min_requirements_other_over_500++;
                        } else {
                          meet_min_requirements_other_unknown++;
                        }
                      } else {
                        if (document !== undefined && document['value'] === "Under £36 million") {
                          does_not_meet_min_requirements_other_under_36++;
                        } else if (document !== undefined && document['value'] === "£36 million to £60 million") {
                          does_not_meet_min_requirements_other_36_60++;
                        } else if (document !== undefined && document['value'] === "£60 million to £100 million") {
                          does_not_meet_min_requirements_other_60_100++;
                        } else if (document !== undefined && document['value'] === "£100 million to £500 million") {
                          does_not_meet_min_requirements_other_100_500++;
                        } else if (document !== undefined && document['value'] === "Over £500 million") {
                          does_not_meet_min_requirements_other_over_500++;
                        } else {
                          does_not_meet_min_requirements_other_unknown++;
                        }
                      }
                    }

                    let json = [{
                      "name": "Statements",
                      "id": 0,
                      "alt_name": "Statements"
                    }, {
                      "name": "Garment Sector",
                      "id": 1,
                      "parent": 0,
                      "alt_name": "Garment Sector"
                    },
                      {
                        "name": "Financial Sector",
                        "id": 2,
                        "parent": 0,
                        "alt_name": "Financial Sector"
                      },
                      {
                        "name": "Hospitality Sector",
                        "id": 3,
                        "parent": 0,
                        "alt_name": "Hospitality Sector"
                      },
                      {
                        "name": "Other",
                        "id": 4,
                        "parent": 0,
                        "alt_name": "Other"
                      },
                      {
                        "id": 5,
                        "name": "<£36M",
                        "alt_name": "<£36M Garment Sector",
                        "parent": 1
                      },
                      {
                        "id": 6,
                        "name": "£36M-£60M",
                        "alt_name": "£36M-£60M Garment Sector",
                        "parent": 1
                      },
                      {
                        "id": 7,
                        "name": "£60M-£100M",
                        "alt_name": "£60M-£100M Garment Sector",
                        "parent": 1
                      },
                      {
                        "id": 8,
                        "name": "£100M-£500M",
                        "alt_name": "£100M-£500M Garment Sector",
                        "parent": 1
                      },
                      {
                        "id": 9,
                        "name": ">£500M",
                        "alt_name": ">£500M Garment Sector",
                        "parent": 1
                      },
                      {
                        "id": 10,
                        "name": "Unknown",
                        "alt_name": "Unknown Garment Sector",
                        "parent": 1
                      },
                      {
                        "id": 11,
                        "name": "<£36M",
                        "alt_name": "<£36M Financial Sector",
                        "parent": 2
                      },
                      {
                        "id": 12,
                        "name": "£36M-£60M",
                        "alt_name": "£36M-£60M Financial Sector",
                        "parent": 2
                      },
                      {
                        "id": 13,
                        "name": "£60M-£100M",
                        "alt_name": "£60M-£100M Financial Sector",
                        "parent": 2
                      },
                      {
                        "id": 14,
                        "name": "£100M-£500M",
                        "alt_name": "£100M-£500M Financial Sector",
                        "parent": 2
                      },
                      {
                        "id": 15,
                        "name": ">£500M",
                        "alt_name": ">£500M Financial Sector",
                        "parent": 2
                      },
                      {
                        "id": 16,
                        "name": "Unknown",
                        "alt_name": "Unknown Financial Sector",
                        "parent": 2
                      },
                      {
                        "id": 17,
                        "name": "<£36M",
                        "alt_name": "<£36M Hospitality Sector",
                        "parent": 3
                      },
                      {
                        "id": 18,
                        "name": "£36M-£60M",
                        "alt_name": "£36M-£60M Hospitality Sector",
                        "parent": 3
                      },
                      {
                        "id": 19,
                        "name": "£60M-£100M",
                        "alt_name": "£60M-£100M Hospitality Sector",
                        "parent": 3
                      },
                      {
                        "id": 20,
                        "name": "£100M-£500M",
                        "alt_name": "£100M-£500M Hospitality Sector",
                        "parent": 3
                      },
                      {
                        "id": 21,
                        "name": ">£500M",
                        "alt_name": ">£500M Hospitality Sector",
                        "parent": 3
                      },
                      {
                        "id": 22,
                        "name": "Unknown",
                        "alt_name": "Unknown Hospitality Sector",
                        "parent": 3
                      },
                      {
                        "id": 23,
                        "name": "<£36M",
                        "alt_name": "<£36M Other",
                        "parent": 4
                      },
                      {
                        "id": 24,
                        "name": "£36M-£60M",
                        "alt_name": "£36M-£60M Other",
                        "parent": 4
                      },
                      {
                        "id": 25,
                        "name": "£60M-£100M",
                        "alt_name": "£60M-£100M Other",
                        "parent": 4
                      },
                      {
                        "id": 26,
                        "name": "£100M-£500M",
                        "alt_name": "£100M-£500M Other",
                        "parent": 4
                      },
                      {
                        "id": 27,
                        "name": ">£500M",
                        "alt_name": ">£500M Other",
                        "parent": 4
                      },
                      {
                        "id": 28,
                        "name": "Unknown",
                        "alt_name": "Unknown Other",
                        "parent": 4
                      },
                      {
                        "id": 29,
                        "name": "Meet Minimum Requirements",
                        "alt_name": "Meet Minimum Requirements",
                        "parent": 5,
                        "size": meet_min_requirements_garment_under_36
                      },
                      {
                        "id": 30,
                        "name": "Do Not Meet Minimum Requirements",
                        "alt_name": "Do Not Meet Minimum Requirements",
                        "parent": 5,
                        "size": does_not_meet_min_requirements_garment_under_36
                      },
                      {
                        "id": 31,
                        "name": "Meet Minimum Requirements",
                        "alt_name": "Meet Minimum Requirements",
                        "parent": 6,
                        "size": meet_min_requirements_garment_36_60
                      },
                      {
                        "id": 32,
                        "name": "Do Not Meet Minimum Requirements",
                        "alt_name": "Do Not Meet Minimum Requirements",
                        "parent": 6,
                        "size": does_not_meet_min_requirements_garment_36_60
                      }
                      ,
                      {
                        "id": 33,
                        "name": "Meet Minimum Requirements",
                        "alt_name": "Meet Minimum Requirements",
                        "parent": 7,
                        "size": meet_min_requirements_garment_60_100
                      },
                      {
                        "id": 34,
                        "name": "Do Not Meet Minimum Requirements",
                        "alt_name": "Do Not Meet Minimum Requirements",
                        "parent": 7,
                        "size": does_not_meet_min_requirements_garment_60_100
                      },
                      {
                        "id": 35,
                        "name": "Meet Minimum Requirements",
                        "alt_name": "Meet Minimum Requirements",
                        "parent": 8,
                        "size": meet_min_requirements_garment_100_500
                      },
                      {
                        "id": 36,
                        "name": "Do Not Meet Minimum Requirements",
                        "alt_name": "Do Not Meet Minimum Requirements",
                        "parent": 8,
                        "size": does_not_meet_min_requirements_garment_100_500
                      },
                      {
                        "id": 37,
                        "name": "Meet Minimum Requirements",
                        "alt_name": "Meet Minimum Requirements",
                        "parent": 9,
                        "size": meet_min_requirements_garment_over_500
                      },
                      {
                        "id": 38,
                        "name": "Do Not Meet Minimum Requirements",
                        "alt_name": "Do Not Meet Minimum Requirements",
                        "parent": 9,
                        "size": does_not_meet_min_requirements_garment_over_500
                      },
                      {
                        "id": 39,
                        "name": "Meet Minimum Requirements",
                        "alt_name": "Meet Minimum Requirements",
                        "parent": 10,
                        "size": meet_min_requirements_garment_unknown
                      },
                      {
                        "id": 40,
                        "name": "Do Not Meet Minimum Requirements",
                        "alt_name": "Do Not Meet Minimum Requirements",
                        "parent": 10,
                        "size": does_not_meet_min_requirements_garment_unknown
                      },
                      {
                        "id": 41,
                        "name": "Meet Minimum Requirements",
                        "alt_name": "Meet Minimum Requirements",
                        "parent": 11,
                        "size": meet_min_requirements_financial_under_36
                      },
                      {
                        "id": 42,
                        "name": "Do Not Meet Minimum Requirements",
                        "alt_name": "Do Not Meet Minimum Requirements",
                        "parent": 11,
                        "size": does_not_meet_min_requirements_financial_under_36
                      },
                      {
                        "id": 43,
                        "name": "Meet Minimum Requirements",
                        "alt_name": "Meet Minimum Requirements",
                        "parent": 12,
                        "size": meet_min_requirements_financial_36_60
                      },
                      {
                        "id": 44,
                        "name": "Do Not Meet Minimum Requirements",
                        "alt_name": "Do Not Meet Minimum Requirements",
                        "parent": 12,
                        "size": does_not_meet_min_requirements_financial_36_60
                      },
                      {
                        "id": 45,
                        "name": "Meet Minimum Requirements",
                        "alt_name": "Meet Minimum Requirements",
                        "parent": 13,
                        "size": meet_min_requirements_financial_60_100
                      },
                      {
                        "id": 46,
                        "name": "Do Not Meet Minimum Requirements",
                        "alt_name": "Do Not Meet Minimum Requirements",
                        "parent": 13,
                        "size": does_not_meet_min_requirements_financial_60_100
                      },
                      {
                        "id": 47,
                        "name": "Meet Minimum Requirements",
                        "alt_name": "Meet Minimum Requirements",
                        "parent": 14,
                        "size": meet_min_requirements_financial_100_500
                      },
                      {
                        "id": 48,
                        "name": "Do Not Meet Minimum Requirements",
                        "alt_name": "Do Not Meet Minimum Requirements",
                        "parent": 14,
                        "size": does_not_meet_min_requirements_financial_100_500
                      },
                      {
                        "id": 49,
                        "name": "Meet Minimum Requirements",
                        "alt_name": "Meet Minimum Requirements",
                        "parent": 15,
                        "size": meet_min_requirements_financial_over_500
                      },
                      {
                        "id": 50,
                        "name": "Do Not Meet Minimum Requirements",
                        "alt_name": "Do Not Meet Minimum Requirements",
                        "parent": 15,
                        "size": does_not_meet_min_requirements_financial_over_500
                      },
                      {
                        "id": 51,
                        "name": "Meet Minimum Requirements",
                        "alt_name": "Meet Minimum Requirements",
                        "parent": 16,
                        "size": meet_min_requirements_financial_unknown
                      },
                      {
                        "id": 52,
                        "name": "Do Not Meet Minimum Requirements",
                        "alt_name": "Do Not Meet Minimum Requirements",
                        "parent": 16,
                        "size": does_not_meet_min_requirements_financial_unknown
                      },
                      {
                        "id": 53,
                        "name": "Meet Minimum Requirements",
                        "alt_name": "Meet Minimum Requirements",
                        "parent": 17,
                        "size": meet_min_requirements_hospitality_under_36
                      },
                      {
                        "id": 54,
                        "name": "Do Not Meet Minimum Requirements",
                        "alt_name": "Do Not Meet Minimum Requirements",
                        "parent": 17,
                        "size": does_not_meet_min_requirements_hospitality_under_36
                      },
                      {
                        "id": 55,
                        "name": "Meet Minimum Requirements",
                        "alt_name": "Meet Minimum Requirements",
                        "parent": 18,
                        "size": meet_min_requirements_hospitality_36_60
                      },
                      {
                        "id": 56,
                        "name": "Do Not Meet Minimum Requirements",
                        "alt_name": "Do Not Meet Minimum Requirements",
                        "parent": 18,
                        "size": does_not_meet_min_requirements_hospitality_36_60
                      },
                      {
                        "id": 57,
                        "name": "Meet Minimum Requirements",
                        "alt_name": "Meet Minimum Requirements",
                        "parent": 19,
                        "size": meet_min_requirements_hospitality_60_100
                      },
                      {
                        "id": 58,
                        "name": "Do Not Meet Minimum Requirements",
                        "alt_name": "Do Not Meet Minimum Requirements",
                        "parent": 19,
                        "size": does_not_meet_min_requirements_hospitality_60_100
                      },
                      {
                        "id": 59,
                        "name": "Meet Minimum Requirements",
                        "alt_name": "Meet Minimum Requirements",
                        "parent": 20,
                        "size": meet_min_requirements_hospitality_100_500
                      },
                      {
                        "id": 60,
                        "name": "Do Not Meet Minimum Requirements",
                        "alt_name": "Do Not Meet Minimum Requirements",
                        "parent": 20,
                        "size": does_not_meet_min_requirements_hospitality_100_500
                      },
                      {
                        "id": 61,
                        "name": "Meet Minimum Requirements",
                        "alt_name": "Meet Minimum Requirements",
                        "parent": 21,
                        "size": meet_min_requirements_hospitality_over_500
                      },
                      {
                        "id": 62,
                        "name": "Do Not Meet Minimum Requirements",
                        "alt_name": "Do Not Meet Minimum Requirements",
                        "parent": 21,
                        "size": does_not_meet_min_requirements_hospitality_over_500
                      },
                      {
                        "id": 63,
                        "name": "Meet Minimum Requirements",
                        "alt_name": "Meet Minimum Requirements",
                        "parent": 22,
                        "size": meet_min_requirements_hospitality_unknown
                      },
                      {
                        "id": 64,
                        "name": "Do Not Meet Minimum Requirements",
                        "alt_name": "Do Not Meet Minimum Requirements",
                        "parent": 22,
                        "size": does_not_meet_min_requirements_hospitality_unknown
                      },
                      {
                        "id": 65,
                        "name": "Meet Minimum Requirements",
                        "alt_name": "Meet Minimum Requirements",
                        "parent": 23,
                        "size": meet_min_requirements_other_under_36
                      },
                      {
                        "id": 66,
                        "name": "Do Not Meet Minimum Requirements",
                        "alt_name": "Do Not Meet Minimum Requirements",
                        "parent": 23,
                        "size": does_not_meet_min_requirements_other_under_36
                      },
                      {
                        "id": 67,
                        "name": "Meet Minimum Requirements",
                        "alt_name": "Meet Minimum Requirements",
                        "parent": 24,
                        "size": meet_min_requirements_other_36_60
                      },
                      {
                        "id": 68,
                        "name": "Do Not Meet Minimum Requirements",
                        "alt_name": "Do Not Meet Minimum Requirements",
                        "parent": 24,
                        "size": does_not_meet_min_requirements_other_36_60
                      },
                      {
                        "id": 69,
                        "name": "Meet Minimum Requirements",
                        "alt_name": "Meet Minimum Requirements",
                        "parent": 25,
                        "size": meet_min_requirements_other_60_100
                      },
                      {
                        "id": 70,
                        "name": "Do Not Meet Minimum Requirements",
                        "alt_name": "Do Not Meet Minimum Requirements",
                        "parent": 25,
                        "size": does_not_meet_min_requirements_other_60_100
                      },
                      {
                        "id": 71,
                        "name": "Meet Minimum Requirements",
                        "alt_name": "Meet Minimum Requirements",
                        "parent": 26,
                        "size": meet_min_requirements_other_100_500
                      },
                      {
                        "id": 72,
                        "name": "Do Not Meet Minimum Requirements",
                        "alt_name": "Do Not Meet Minimum Requirements",
                        "parent": 26,
                        "size": does_not_meet_min_requirements_other_100_500
                      },
                      {
                        "id": 73,
                        "name": "Meet Minimum Requirements",
                        "alt_name": "Meet Minimum Requirements",
                        "parent": 27,
                        "size": meet_min_requirements_other_over_500
                      },
                      {
                        "id": 74,
                        "name": "Do Not Meet Minimum Requirements",
                        "alt_name": "Do Not Meet Minimum Requirements",
                        "parent": 27,
                        "size": does_not_meet_min_requirements_other_over_500
                      },
                      {
                        "id": 75,
                        "name": "Meet Minimum Requirements",
                        "alt_name": "Meet Minimum Requirements",
                        "parent": 28,
                        "size": meet_min_requirements_other_unknown
                      },
                      {
                        "id": 76,
                        "name": "Do Not Meet Minimum Requirements",
                        "alt_name": "Do Not Meet Minimum Requirements",
                        "parent": 28,
                        "size": does_not_meet_min_requirements_other_unknown
                      }
                    ]
                    this.chartService.uk_legislation_tree_map(json, "div#tree-map", 0, 0, {
                      renderer: "svg",
                      actions: {source: false, editor: true}
                    }).finally(() => {
                      this.isLoading = false
                    })
                  })
                })
              })
            })
          })
        })
      }
    } else {
      alert("Under Construction...")
    }
  }
}
