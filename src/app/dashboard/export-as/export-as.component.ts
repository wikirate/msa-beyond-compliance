import {Component, Input, OnInit} from '@angular/core';
import {ExportAsConfig, ExportAsService} from "ngx-export-as";

@Component({
  selector: 'export-as',
  templateUrl: './export-as.component.html',
  styleUrls: ['./export-as.component.scss']
})
export class ExportAsComponent implements OnInit {

  @Input()
  elementId: string = ''
  @Input()
  sector: string = 'all-sectors'
  @Input()
  filePrefix: string = ''
  waiting: boolean = false;

  constructor(private exportAsService: ExportAsService) {
  }

  ngOnInit(): void {
  }

  export() {
    this.waiting = true;
    var exportAsConfig: ExportAsConfig = {
      type: 'png', // the type you want to download
      elementIdOrContent: this.elementId, // the id of html/table element
      options:{
        scale: 3
      }
    }
    this.exportAsService.save(exportAsConfig, this.filePrefix + '-' + this.sector).subscribe(() => {
    }, () => {
    }, () => {
      this.waiting = false
    });
  }


}
