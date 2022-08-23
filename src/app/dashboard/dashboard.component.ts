import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Data, ParamMap} from "@angular/router";
import {SectorProvider} from "../services/sector.provider";
import {ViewportScroller} from "@angular/common";

@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  sector: string = "all-sectors"
  view: string = "default";

  constructor(private route: ActivatedRoute, private sectorProvider: SectorProvider, private scroll: ViewportScroller) {
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
    this.route.queryParams
      .subscribe(params => {
          // @ts-ignore
          this.view = params.view;
        }
      );
    this.sectorProvider.getPath().next("dashboard")
    this.scrollToTop()
  }

  scrollToTop() {
    this.scroll.scrollToPosition([0, 0]);
  }

}
