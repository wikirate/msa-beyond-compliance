import {Component, Input, OnInit} from '@angular/core';

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

  constructor() {
  }

  ngOnInit(): void {
  }

  updateData() {

  }
}
