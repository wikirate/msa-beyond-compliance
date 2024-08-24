import { Component, OnInit } from '@angular/core';
// @ts-ignore
import case_studies from "../../assets/case-studies/electronics.json"

@Component({
  selector: 'app-case-studies',
  templateUrl: './case-studies.component.html',
  styleUrls: ['./case-studies.component.scss']
})
export class CaseStudiesComponent implements OnInit {

  case_studies = case_studies
  constructor() { }

  ngOnInit(): void {
  }

}
