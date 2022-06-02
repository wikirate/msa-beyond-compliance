import {AfterContentInit, AfterViewInit, ChangeDetectorRef, Component, Input, OnChanges, OnInit} from '@angular/core';
import {SectorProvider} from "../../services/sector.provider";
import {DataProvider} from "../../services/data.provider";

@Component({
  selector: 'introductory-section',
  templateUrl: './introductory-section.component.html',
  styleUrls: ['./introductory-section.component.scss']
})
export class IntroductorySectionComponent implements OnInit, AfterViewInit {

  sector: string | null = 'all-sectors';
  company_group: string = '';
  page: string | null = 'dashboard';

  constructor(private sectorProvider: SectorProvider, private dataProvider: DataProvider, private cd: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.sectorProvider.getSector().subscribe(sector => {
      this.sector = sector;
      this.company_group = this.dataProvider.getCompanyGroup(sector)
    })
  }

  ngAfterViewInit(): void {
    this.sectorProvider.getPath().subscribe(path => {
      this.page = path;
    }, error => {
    }, () => {
      this.cd.detectChanges()
    })

  }

}
