import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, NavigationEnd, ParamMap, Router} from "@angular/router";
import {SectorProvider} from "../services/sector.provider";

@Component({
  selector: 'header-component',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  selectedSector: string = "All Sectors"
  selectedSection: string = "dashboard"

  constructor(private sectorProvider: SectorProvider) {
  }

  ngOnInit(): void {
    this.sectorProvider.getSector().subscribe(sector => {
      if (sector === "all-sectors" && sector !== this.selectedSector) {
        this.selectedSector = "All Sectors"
      } else if (sector === "garments-sector" && sector !== this.selectedSector) {
        this.selectedSector = "Garments"
      } else if (sector === "asset-managers-sector" && sector !== this.selectedSector) {
        this.selectedSector = "Asset Managers"
      } else if (sector === "hospitality-sector" && sector !== this.selectedSector) {
        this.selectedSector = "Hospitality"
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
