import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ExportAsConfig, ExportAsService } from "ngx-export-as";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

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
  section: string = ''
  @Input()
  button_class: string = 'btn-deep-blue'
  baseUrl: string = ''
  waiting: boolean = false;
  src_content: string = "";

  @ViewChild("embed") embed!: TemplateRef<any>;

  constructor(private exportAsService: ExportAsService, private modalService: NgbModal) {
  }

  ngOnInit(): void {
    this.baseUrl = window.location.origin+'/dashboard/';
    this.src_content = '<iframe src=\'' + this.baseUrl + this.section + '/' + this.sector + '?view=embed\' width=\'100%\' height=\'100%\' frameborder=\'0\'></iframe>';
  }

  export() {
    this.waiting = true;
    var exportAsConfig: ExportAsConfig = {
      type: 'png', // the type you want to download
      elementIdOrContent: this.elementId, // the id of html/table element
      options: {
        scale: 3
      }
    }
    this.exportAsService.save(exportAsConfig, this.section + '-' + this.sector).subscribe(() => {
    }, () => {
    }, () => {
      this.waiting = false
    });
  }

  openModal() {
    this.modalService.open(this.embed, { centered: true });
  }


}
