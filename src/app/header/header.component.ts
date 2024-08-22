import {Component, OnInit} from '@angular/core';
import {SectorProvider} from "../services/sector.provider";
import {DataProvider} from "../services/data.provider";

@Component({
  selector: 'header-component',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  selectedSector: string = "All Sectors"
  selectedSection: string = "dashboard"
  path: string | null = ""
  sectors = {}

  constructor(private sectorProvider: SectorProvider, private dataProvider: DataProvider) {
    this.sectors = dataProvider.sectors
  }

  ngOnInit(): void {
    this.sectorProvider.getSector().subscribe(sector => {
      if (sector === "all-sectors" && sector !== this.selectedSector) {
        this.selectedSector = "All Sectors"
      } else if (sector === "food-and-beverage" && sector !== this.selectedSector) {
        this.selectedSector = "Food & Beverage"
      } else if (sector === "garment-sector" && sector !== this.selectedSector) {
        this.selectedSector = "Garment"
      } else if (sector === "financial-sector" && sector !== this.selectedSector) {
        this.selectedSector = "Financial"
      } else if (sector === "hospitality-sector" && sector !== this.selectedSector) {
        this.selectedSector = "Hospitality"
      }
    })
    this.sectorProvider.getPath().subscribe(path => {
      if (path === "dashboard" || path === "about"|| path === "case-studies" || path === "subscribe")
        this.path = '';
      else {
        this.path = path + '/'
      }
    })
  }

  onSelectSector(sector: string) {
    this.selectedSector = sector;
  }

  onSelectSection(section: string) {
    this.selectedSection = section
  }
}
