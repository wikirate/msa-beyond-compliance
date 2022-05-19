import {Component, OnInit} from '@angular/core';
import {SectorProvider} from "../services/sector.provider";

@Component({
  selector: 'header-component',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  selectedSector: string = "All Sectors"
  selectedSection: string = "dashboard"
  path: string | null = ""

  constructor(private sectorProvider: SectorProvider) {
  }

  ngOnInit(): void {
    this.sectorProvider.getSector().subscribe(sector => {
      if (sector === "all-sectors" && sector !== this.selectedSector) {
        this.selectedSector = "All Sectors"
      } else if (sector === "garment-sector" && sector !== this.selectedSector) {
        this.selectedSector = "Garment"
      } else if (sector === "financial-sector" && sector !== this.selectedSector) {
        this.selectedSector = "Financial"
      } else if (sector === "hospitality-sector" && sector !== this.selectedSector) {
        this.selectedSector = "Hospitality"
      }
    })
    this.sectorProvider.getPath().subscribe(path => {
      if (path === "dashboard")
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
