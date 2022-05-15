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
  currentIndex = 1
  contributors = [
    {
      "contributor": "Australian National University",
      "logo": "https://dq06ugkuram52.cloudfront.net/files/5295432/20444349-medium.png"
    },
    {
      "contributor": "ESCP Europe",
      "logo": "https://dq06ugkuram52.cloudfront.net/files/1779114/12602972-medium.png"
    },
    {
      "contributor": "John Hopkins University",
      "logo": "https://dq06ugkuram52.cloudfront.net/files/2749557/12774885-medium.jpg"
    },
    {
      "contributor": "Lancaster University Management School",
      "logo": "https://dq06ugkuram52.cloudfront.net/files/12639475/33117884-medium.png"
    },
    {
      "contributor": "School of International and Public Affairs at Columbia University",
      "logo": "https://dq06ugkuram52.cloudfront.net/files/12639482/33117897-medium.png"
    },
    {
      "contributor": "University of Amsterdam",
      "logo": "https://dq06ugkuram52.cloudfront.net/files/5759131/21999891-medium.png"
    },
    {
      "contributor": "University of British Columbia",
      "logo": "https://dq06ugkuram52.cloudfront.net/files/2877117/13099211-medium.png"
    },
    {
      "contributor": "University of Connecticut",
      "logo": "https://dq06ugkuram52.cloudfront.net/files/2877060/13099154-medium.png"
    },
    {
      "contributor": "University of Nottingham",
      "logo": "https://dq06ugkuram52.cloudfront.net/files/3149947/13561221-medium.png"
    },
    {
      "contributor": "University of Western Australia",
      "logo": "https://dq06ugkuram52.cloudfront.net/files/2549359/12602502-medium.jpeg"
    }];

  constructor() {
  }

  ngOnInit(): void {
    this.table = JSON.parse(JSON.stringify(methodology_table));
  }

}
