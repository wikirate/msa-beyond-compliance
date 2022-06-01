import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {SectorProvider} from "../services/sector.provider";

@Component({
  selector: 'app-subscribe',
  templateUrl: './subscribe.component.html',
  styleUrls: ['./subscribe.component.scss']
})
export class SubscribeComponent implements OnInit {

  constructor(private route: ActivatedRoute, private sectorProvider: SectorProvider) { }

  ngOnInit(): void {
    this.route.url.subscribe(val => {
      if (val[0].path === 'subscribe')
        this.sectorProvider.getPath().next(val[0].path)
    })
  }

}
