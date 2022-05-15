import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  current_year: number = 2022

  constructor() {
    this.current_year = new Date().getFullYear()
  }

  ngOnInit(): void {
  }

}
