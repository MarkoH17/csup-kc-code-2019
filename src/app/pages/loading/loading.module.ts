import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { LoadingPage } from './loading';
import { TutorialPageRoutingModule } from './loading-routing.module';
import { MomentModule } from 'ngx-moment';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    TutorialPageRoutingModule,
    MomentModule
  ],
  declarations: [LoadingPage],
  entryComponents: [LoadingPage],
})
export class LoadingModule {}
