import {Component, OnInit} from '@angular/core';
import {SectorProvider} from "../services/sector.provider";
import {DataProvider} from "../services/data.provider";
import { ActivatedRoute, ParamMap } from '@angular/router';

@Component({
  selector: 'header-component',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  selectedSector: string = "Choose your Sector"
  selectedSection: string = "dashboard"
  path: string | null = ""
  sectors = {}
  isMenuOpen = false

  constructor(private sectorProvider: SectorProvider, private dataProvider: DataProvider,  private route: ActivatedRoute) {
    this.sectors = dataProvider.sectors
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params: ParamMap) => {
              let sector = params.get('sector');
              this.sectorProvider.getSector().next(sector);
            })
    this.sectorProvider.getSector().subscribe(sector => {
      if (sector === "all-sectors" && sector !== this.selectedSector) {
        this.selectedSector = "Choose your Sector"
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
    this.selectedSector = sector == "All Sectors" ? "Choose your Sector" : sector
  }

  onSelectSection(section: string) {
    this.selectedSection = section
  }

  toggleMenu(){
    this.isMenuOpen = !this.isMenuOpen
  }
}
