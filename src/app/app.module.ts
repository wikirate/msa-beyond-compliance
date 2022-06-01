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
import { AssessedStatementsOverviewComponent } from './dashboard/assessed-statments-overview/assessed-statements-overview.component';
import {PercentageFormatPipe} from "./pipes/percentage-format.pipe";
import { DisclosureRatesComponent } from './dashboard/disclosure-rates/disclosure-rates.component';
import { ApproachToPoliciesComponent } from './dashboard/further-findings-alternative-two/approach-to-policies/approach-to-policies.component';
import { FurtherFindingsComponent } from './dashboard/further-findings-alternative-two/further-findings.component';
import { ApproachToIncidentsComponent } from './dashboard/further-findings-alternative-two/approach-to-incidents/approach-to-incidents.component';
import {
  ApproachToRisksComponent
} from "./dashboard/further-findings-alternative-two/approach-to-risks/approach-to-risks.component";
import { SectionComponent } from './section/section.component';
import {ExportAsModule} from "ngx-export-as";
import { ExportAsComponent } from './dashboard/export-as/export-as.component';
import {ClipboardModule} from "ngx-clipboard";
import { SubscribeComponent } from './subscribe/subscribe.component';

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
    AssessedStatementsOverviewComponent,
    DisclosureRatesComponent,
    ApproachToIncidentsComponent,
    ApproachToRisksComponent,
    ApproachToPoliciesComponent,
    FurtherFindingsComponent,
    SectionComponent,
    ExportAsComponent,
    SubscribeComponent
  ],
  imports: [
    FormsModule,
    HttpClientModule,
    BrowserModule,
    BrowserAnimationsModule,
    NgbModule,
    AppRoutingModule,
    ExportAsModule,
    ClipboardModule
  ],
  providers: [SectorProvider, DataProvider, ChartsService],
  bootstrap: [AppComponent]
})
export class AppModule {
}
