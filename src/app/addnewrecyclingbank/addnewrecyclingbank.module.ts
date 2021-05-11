import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddnewrecyclingbankPageRoutingModule } from './addnewrecyclingbank-routing.module';

import { AddnewrecyclingbankPage } from './addnewrecyclingbank.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddnewrecyclingbankPageRoutingModule
  ],
  declarations: [AddnewrecyclingbankPage]
})
export class AddnewrecyclingbankPageModule {}
