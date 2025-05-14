import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  view: string = 'default';

  constructor(private route: ActivatedRoute, private router: Router) {
  }

  ngOnInit(): void {
    this.route.queryParams
      .subscribe(params => {
          // @ts-ignore
          this.view = params.view;
        }
      );
  }
}
