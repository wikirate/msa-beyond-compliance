import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { AboutComponent } from './about/about.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { FormsModule } from "@angular/forms";
import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import { SectorProvider } from "./services/sector.provider";
import { IntroductorySectionComponent } from './dashboard/introductory-section/introductory-section.component';
import { KeyFindingsSectionComponent } from './dashboard/key-findings-section/key-findings-section.component';
import {
  MinimumRequirementsSectionComponent
} from './dashboard/minimum-requirements-section/minimum-requirements-section.component';
import { DataProvider } from "./services/data.provider";
import { NumFormatPipe } from "./pipes/num-format.pipe";
import { ChartsService } from "./services/charts.service";
import { PercentageFormatPipe } from "./pipes/percentage-format.pipe";
import { DisclosureRatesComponent } from './dashboard/disclosure-rates/disclosure-rates.component';
import { ApproachToPoliciesComponent } from './dashboard/further-findings-alternative-two/approach-to-policies/approach-to-policies.component';
import { FurtherFindingsComponent } from './dashboard/further-findings-alternative-two/further-findings.component';
import { ApproachToIncidentsComponent } from './dashboard/further-findings-alternative-two/approach-to-incidents/approach-to-incidents.component';
import {
  ApproachToRisksComponent
} from "./dashboard/further-findings-alternative-two/approach-to-risks/approach-to-risks.component";
import { SectionComponent } from './section/section.component';
import { ExportAsModule } from "ngx-export-as";
import { ClipboardModule } from "ngx-clipboard";
import { SubscribeComponent } from './subscribe/subscribe.component';
import { SpotlightMetricsComponent } from './dashboard/spotlight-metrics/spotlight-metrics.component';
import { BeyondComplianceComponent } from './dashboard/beyond-compliance/beyond-compliance.component';
import { HighlightMetricComponent } from './dashboard/highlight-metric/highlight-metric.component';
import { SliderComponent } from './slider/slider.component';
import { SliderItemDirective } from './slider/slider-item.directive';
import { CaseStudiesComponent } from './case-studies/case-studies.component';
import { GoingBeyondComplianceComponent } from './dashboard/going-beyond-compliance/going-beyond-compliance.component';
import { RouterModule } from '@angular/router';
import { ExportAsComponent } from './dashboard/export-as/export-as.component';
import { CommonModule } from '@angular/common';
import { provideMarkdown } from 'ngx-markdown';

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
    DisclosureRatesComponent,
    ApproachToIncidentsComponent,
    ApproachToRisksComponent,
    ApproachToPoliciesComponent,
    FurtherFindingsComponent,
    SectionComponent,
    ExportAsComponent,
    SubscribeComponent,
    SpotlightMetricsComponent,
    BeyondComplianceComponent,
    HighlightMetricComponent,
    SliderComponent,
    SliderItemDirective,
    CaseStudiesComponent,
    GoingBeyondComplianceComponent
  ],
  bootstrap: [AppComponent],
  imports: [
    FormsModule,
    BrowserModule,
    BrowserAnimationsModule,
    NgbModule,
    RouterModule,
    AppRoutingModule,
    ExportAsModule,
    ClipboardModule],
  providers: [SectorProvider, DataProvider, ChartsService, provideHttpClient(withInterceptorsFromDi()), provideMarkdown()]
})
export class AppModule {
}

