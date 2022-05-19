import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {SectorProvider} from "../../services/sector.provider";
import {DataProvider} from "../../services/data.provider";

@Component({
  selector: 'introductory-section',
  templateUrl: './introductory-section.component.html',
  styleUrls: ['./introductory-section.component.scss']
})
export class IntroductorySectionComponent implements OnInit, OnChanges {

  sector: string | null = 'all-sectors';
  company_group: string = '';

  constructor(private sectorProvider: SectorProvider, private dataProvider: DataProvider) {
  }

  ngOnInit(): void {
    this.sectorProvider.getSector().subscribe(sector => {
      this.sector = sector;
      this.company_group = this.dataProvider.getCompanyGroup(sector)
    })
  }

  ngOnChanges(): void {
  }

}
