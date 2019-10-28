import {Component, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import { Router } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';

import {Events, IonList, MenuController, Platform, ToastController} from '@ionic/angular';

import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { Storage } from '@ionic/storage';
import { process } from './providers/process';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit {
  appPages = [
    {
      title: 'About',
      url: '/app/tabs/about',
      icon: 'information-circle'
    }
  ];

  @ViewChild('industryList', { static: true }) industryList: IonList;
  @ViewChild('locationList', { static: true }) locationList: IonList;
  dark = true;
  industs: any;
  locations: any;
  industryQueryText = '';
  locationQueryText = '';
  hideIndustry = false;
  hideLocation = false;
  clickedIndustryOption = false;
  clickedLocationOption = false;
  indCount = 0;
  locCount = 0;
  locID: any;
  indID: any;
  constructor(
    private events: Events,
    private menu: MenuController,
    private platform: Platform,
    private router: Router,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private storage: Storage,
    private swUpdate: SwUpdate,
    private toastCtrl: ToastController,
    public indData: process
  ) {
    this.initializeApp();
  }

  async ngOnInit() {

    this.swUpdate.available.subscribe(async res => {
      const toast = await this.toastCtrl.create({
        message: 'Update available!',
        showCloseButton: true,
        position: 'bottom',
        closeButtonText: `Reload`
      });

      await toast.present();

      toast
        .onDidDismiss()
        .then(() => this.swUpdate.activateUpdate())
        .then(() => window.location.reload());
    });
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  updateIndustry() {
    // Close any open sliding items when the schedule updates
    if (this.industryList) {
      this.industryList.closeSlidingItems();
    }
    this.indData.getIndustry(this.industryQueryText).subscribe((data: any) => {
      this.industs = data.topics;
    });
    if (!this.clickedIndustryOption) {

      this.hideIndustry = false;
    } else {
      if (this.indCount > 0) {
        this.indCount = 0;
        this.clickedIndustryOption = !this.clickedIndustryOption;
      } else {
        this.indCount++;
      }
    }
  }

  hideIndustries() {
    this.clickedIndustryOption = !this.clickedIndustryOption;
    this.hideIndustry = !this.hideIndustry;
  }

  updateLocations() {
    // Close any open sliding items when the schedule updates
    if (this.locationList) {
      this.locationList.closeSlidingItems();
    }
    this.locations = this.indData.getLocation(this.locationQueryText).subscribe((data: any) => {
      this.locations = data;
    });
    if (!this.clickedLocationOption) {
      this.hideLocation = false;
    } else {
      if (this.locCount > 0) {
        this.locCount = 0;
        this.clickedLocationOption = !this.clickedLocationOption;
      } else {
        this.locCount++;
      }
    }
  }

  hideLocations() {
    this.clickedLocationOption = !this.clickedLocationOption;
    this.hideLocation = !this.hideLocation;
  }

  stringifyData() {
    if (this.locID && this.indID) {
      const dat = {
        'place_id': encodeURI(this.locID.place_id),
        'place_description': encodeURI(this.locID.place_description),
        'industry_id': encodeURI(this.indID.mid),
        'industry_description': encodeURI(this.indID.title)
      };
      return btoa(JSON.stringify(dat));
    }
  }
}
