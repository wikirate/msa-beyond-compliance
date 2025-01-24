import { AfterContentInit, AfterViewInit, ChangeDetectorRef, Component, Input, OnChanges, OnInit } from '@angular/core';
import { SectorProvider } from "../../services/sector.provider";
import { DataProvider } from "../../services/data.provider";
import { WikirateUrlBuilder } from 'src/app/utils/wikirate-url-builder';
import { Filter } from 'src/app/models/filter.model';
import { ActivatedRoute, ParamMap } from '@angular/router';

@Component({
  selector: 'introductory-section',
  templateUrl: './introductory-section.component.html',
  styleUrls: ['./introductory-section.component.scss']
})
export class IntroductorySectionComponent implements OnInit, AfterViewInit {

  sector: string | null = 'all-sectors';
  company_group: string = '';
  page: string | null = 'dashboard';
  dataset_url: string = '';

  constructor(private sectorProvider: SectorProvider, private dataProvider: DataProvider, private cd: ChangeDetectorRef, private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params: ParamMap) => {
          let sector = params.get('sector');
          if (sector !== null) {
            this.sector = sector
          }
          this.sectorProvider.getSector().next(sector);
        })
    this.dataset_url = this.sector == 'all-sectors' ? 'https://wikirate.org/Corporate_Reporting_on_Modern_Slavery_A_Dataset_on_Compliance_and_Beyond' : new WikirateUrlBuilder()
        .setEndpoint('Corporate_Reporting_on_Modern_Slavery_A_Dataset_on_Compliance_and_Beyond')
        .addFilter(new Filter('company_group', this.company_group))
        .build()
    this.sectorProvider.getSector().subscribe(sector => {
      this.sector = sector;
      this.company_group = this.dataProvider.getCompanyGroup(sector)
      this.dataset_url = sector == 'all-sectors' ? 'https://wikirate.org/Corporate_Reporting_on_Modern_Slavery_A_Dataset_on_Compliance_and_Beyond' : new WikirateUrlBuilder()
        .setEndpoint('Corporate_Reporting_on_Modern_Slavery_A_Dataset_on_Compliance_and_Beyond')
        .addFilter(new Filter('company_group', this.company_group))
        .build()
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
