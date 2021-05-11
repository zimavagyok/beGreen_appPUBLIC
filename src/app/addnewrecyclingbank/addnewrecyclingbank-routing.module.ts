import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddnewrecyclingbankPage } from './addnewrecyclingbank.page';

const routes: Routes = [
  {
    path: '',
    component: AddnewrecyclingbankPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddnewrecyclingbankPageRoutingModule {}
