import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'treemap',
  templateUrl: './treemap.component.html',
  styleUrls: ['./treemap.component.scss']
})
export class TreemapComponent implements OnInit {

  year: number | string = 'latest';
  legislation: string = 'both';

  constructor() { }

  ngOnInit(): void {
  }

  updateData() {

  }
}
