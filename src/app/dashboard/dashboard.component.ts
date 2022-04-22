import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Data, ParamMap} from "@angular/router";
import {SectorProvider} from "../services/sector.provider";

@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  sector: string = "all-sectors"

  constructor(private route: ActivatedRoute, private sectorProvider: SectorProvider) {
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params: ParamMap) => {
        let sector = params.get('sector');
        if (sector !== null && sector != this.sector) {
          this.sector = sector
        }
        this.sectorProvider.getSector().next(sector);
      }
    )
  }

}
