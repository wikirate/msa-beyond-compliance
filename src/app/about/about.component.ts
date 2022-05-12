import {Component, OnInit} from '@angular/core';
// @ts-ignore
import methodology_table from '../../assets/methodology_table.json';

@Component({
  selector: 'about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {
  table: any[] = [];

  constructor() {
  }

  ngOnInit(): void {
    this.table = JSON.parse(JSON.stringify(methodology_table));
  }

}
