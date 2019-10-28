import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SessionDetailPage } from './result-detail';
import { SessionDetailPageRoutingModule } from './result-detail-routing.module';
import { IonicModule } from '@ionic/angular';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    SessionDetailPageRoutingModule
  ],
  declarations: [
    SessionDetailPage,
  ]
})
export class ResultDetailModule { }
