import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {HeaderComponent} from './header/header.component';
import {FooterComponent} from './footer/footer.component';
import {AboutComponent} from './about/about.component';
import {DashboardComponent} from './dashboard/dashboard.component';
import {NgbModule} from "@ng-bootstrap/ng-bootstrap";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {FormsModule} from "@angular/forms";
import {HttpClientModule} from "@angular/common/http";
import {SectorProvider} from "./services/sector.provider";
import {IntroductorySectionComponent} from './dashboard/introductory-section/introductory-section.component';
import {KeyFindingsSectionComponent} from './dashboard/key-findings-section/key-findings-section.component';
import {
  MinimumRequirementsSectionComponent
} from './dashboard/minimum-requirements-section/minimum-requirements-section.component';
import {DataProvider} from "./services/data.provider";
import {NumFormatPipe} from "./pipes/num-format.pipe";
import {ChartsService} from "./services/charts.service";
import { GoingBeyondComplianceComponent } from './dashboard/going-beyond-compliance/going-beyond-compliance.component';
import { FurtherFindingsComponent } from './dashboard/further-findings/further-findings.component';
import { ApproachToRisksComponent } from './dashboard/further-findings/approach-to-risks/approach-to-risks.component';
import { ApproachToIncidentsComponent } from './dashboard/further-findings/approach-to-incidents/approach-to-incidents.component';
import { ApproachToPoliciesComponent } from './dashboard/further-findings/approach-to-policies/approach-to-policies.component';
import { TreemapComponent } from './dashboard/treemap/treemap.component';
import {PercentageFormatPipe} from "./pipes/percentage-format.pipe";

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    AboutComponent,
    DashboardComponent,
    IntroductorySectionComponent,
    KeyFindingsSectionComponent,
    MinimumRequirementsSectionComponent,
    NumFormatPipe,
    PercentageFormatPipe,
    GoingBeyondComplianceComponent,
    FurtherFindingsComponent,
    ApproachToRisksComponent,
    ApproachToIncidentsComponent,
    ApproachToPoliciesComponent,
    TreemapComponent
  ],
  imports: [
    FormsModule,
    HttpClientModule,
    BrowserModule,
    BrowserAnimationsModule,
    NgbModule,
    AppRoutingModule
  ],
  providers: [SectorProvider, DataProvider, ChartsService],
  bootstrap: [AppComponent]
})
export class AppModule {
}
