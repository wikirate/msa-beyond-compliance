import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ExportAsConfig, ExportAsService } from "ngx-export-as";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import html2canvas from 'html2canvas';
import { delay } from 'rxjs';

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
  const element1 = document.getElementById(this.elementId);  // First element
  const element2 = document.getElementsByTagName("footer")[0];  // Second element

  if (element1 && element2) {
    // Create a temporary container
    const container = document.createElement('div');
    container.style.top = '0';
    container.style.left = '0';
    container.style.zIndex = '-1';  // Ensure it's not visible
    container.style.background = '#F2F2F2'; // Set background to avoid transparency issues
    container.appendChild(element1.cloneNode(true));
    
    const sourceElement = document.createElement('div');
    sourceElement.className = 'bg-grey';
    sourceElement.innerHTML = `
      <div class="ms-3">
        <p><i><b>Source: </b>https://beyondcompliance.wikirate.org</i></p>
      </div>
    `;
    container.appendChild(sourceElement)
    element2.className="mt-0"
    container.appendChild(element2.cloneNode(true));
    document.body.appendChild(container);

    // Use html2canvas on the combined container
    html2canvas(container, { scale: 3 }).then(canvas => {
      const image = canvas.toDataURL('image/png');
      this.downloadImage(image, `${this.section}-${this.sector}.png`);

      // Clean up: remove the temporary container
      document.body.removeChild(container);

      this.waiting = false;
    }).catch(() => {
      this.waiting = false;
    });

  } else {
    console.error('One or both elements not found.');
    this.waiting = false;
  }
  }
  private downloadImage(dataUrl: string, filename: string) {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    link.click();
  }

  openModal() {
    this.modalService.open(this.embed, { centered: true });
  }


}
