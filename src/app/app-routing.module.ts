import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {DashboardComponent} from "./dashboard/dashboard.component";
import {AboutComponent} from "./about/about.component";
import {KeyFindingsSectionComponent} from "./dashboard/key-findings-section/key-findings-section.component";
import {
  MinimumRequirementsSectionComponent
} from "./dashboard/minimum-requirements-section/minimum-requirements-section.component";
import {FurtherFindingsComponent} from "./dashboard/further-findings-alternative-two/further-findings.component";
import {DisclosureRatesComponent} from "./dashboard/disclosure-rates/disclosure-rates.component";
import {SubscribeComponent} from "./subscribe/subscribe.component";
import { BeyondComplianceComponent } from './dashboard/beyond-compliance/beyond-compliance.component';
import { HighlightMetricComponent } from './dashboard/highlight-metric/highlight-metric.component';
import { CaseStudiesComponent } from './case-studies/case-studies.component';
import { GoingBeyondComplianceComponent } from './dashboard/going-beyond-compliance/going-beyond-compliance.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { ImpressumComponent } from './impressum/impressum.component';


const routes: Routes = [
  {
    path: 'dashboard/:sector', component: DashboardComponent
  },
  {path: 'dashboard/key-findings/:sector', component: KeyFindingsSectionComponent},
  {path: 'dashboard/highlight-metric/:sector', component: HighlightMetricComponent},
  {path: 'dashboard/meeting-minimum-requirements/:sector', component: MinimumRequirementsSectionComponent},
  {path: 'dashboard/beyond-compliance/:sector', component: BeyondComplianceComponent},
  {path: 'dashboard/going-beyond-compliance/:sector', component: GoingBeyondComplianceComponent},
  {path: 'dashboard/further-findings/:sector', component: FurtherFindingsComponent},
  {path: 'dashboard/sector-disclosure-rates/:sector', component: DisclosureRatesComponent},
  {path: 'case-studies', component: CaseStudiesComponent},
  {path: 'subscribe', component: SubscribeComponent},
  {path: 'methods', component: AboutComponent},
  {path: 'privacy-policy', component: PrivacyPolicyComponent},
  {path: 'impressum', component: ImpressumComponent},
  {path: '**', redirectTo: '/dashboard/all-sectors', pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
