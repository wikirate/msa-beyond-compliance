import {Component, Input, OnChanges, OnInit} from '@angular/core';

@Component({
  selector: 'introductory-section',
  templateUrl: './introductory-section.component.html',
  styleUrls: ['./introductory-section.component.scss']
})
export class IntroductorySectionComponent implements OnInit, OnChanges {

  @Input()
  sector!: string;

  constructor() {
  }

  ngOnInit(): void {
  }

  ngOnChanges(): void{
  }

}
