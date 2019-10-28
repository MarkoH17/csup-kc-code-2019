import { Component, ViewEncapsulation } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { PopoverController } from '@ionic/angular';


@Component({
  selector: 'page-about',
  templateUrl: 'about.html',
  styleUrls: ['./about.scss'],
})
export class AboutPage {

  constructor(public popoverCtrl: PopoverController,
              public loadingCtrl: LoadingController) { }
}
