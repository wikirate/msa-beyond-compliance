import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'further-findings',
  templateUrl: './further-findings.component.html',
  styleUrls: ['./further-findings.component.scss']
})
export class FurtherFindingsComponent implements OnInit {
  year: number | string = 'latest'

  constructor() {
  }

  ngOnInit(): void {
  }
}
