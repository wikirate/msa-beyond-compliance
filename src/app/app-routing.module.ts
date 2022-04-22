import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {DashboardComponent} from "./dashboard/dashboard.component";
import {AboutComponent} from "./about/about.component";


const routes: Routes = [
  {
    path: 'dashboard/:sector', component: DashboardComponent
  },
  {path: 'about', component: AboutComponent},
  {path: '**', redirectTo: '/dashboard/all-sectors', pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
