import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {Filter} from "../../models/filter.model";
import {DataProvider} from "../../services/data.provider";

@Component({
  selector: 'further-findings-alt-one',
  templateUrl: './further-findings.component.html',
  styleUrls: ['./further-findings.component.scss']
})
export class FurtherFindingsAltOneComponent implements OnInit {
  @Input()
  sector !: string;

  constructor(private dataProvider: DataProvider) {
  }

  ngOnInit(): void {
  }
}
