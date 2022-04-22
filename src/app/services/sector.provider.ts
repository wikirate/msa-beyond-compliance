import {Injectable} from "@angular/core";
import {Observable, Subject, Subscriber} from "rxjs";

@Injectable()
export class SectorProvider {
  sector = new Subject<string | null>()

  constructor() {
    this.sector.next("all-sectors")

  }

  getSector(): Subject<string | null> {
    return this.sector
  }

}
