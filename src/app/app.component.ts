import {Component} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {filter} from "rxjs";

declare let gtag: Function;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  view: string = 'default';

  constructor(private route: ActivatedRoute, private router: Router) {
  }

  ngOnInit(): void {
    this.setUpAnalytics();
    this.route.queryParams
      .subscribe(params => {
          // @ts-ignore
          this.view = params.view;
        }
      );
  }


  private setUpAnalytics() {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd))
      // @ts-ignore
      .subscribe((event: NavigationEnd) => {
        gtag('config', 'UA-',
          {
            'page_path': event.urlAfterRedirects
          }
        );
      });
  }
}
