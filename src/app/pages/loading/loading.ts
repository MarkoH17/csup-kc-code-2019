import {Component, ElementRef, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

import { MenuController, IonSlides } from '@ionic/angular';

import { Storage } from '@ionic/storage';
import { process } from '../../providers/process';
import { Chart } from 'chart.js';
import * as moment from 'moment';

@Component({
  selector: 'page-tutorial',
  templateUrl: 'loading.html',
  styleUrls: ['./loading.scss'],
})
export class LoadingPage implements OnInit {
  showSkip = false;

  @ViewChild('slides', { static: true }) slides: IonSlides;
  @ViewChild('barCanvas', {static: true}) barCanvas: ElementRef;
  private barChart: Chart;
  timeout = 10000;
  samples = 20;
  speed = 75;
  values = [];
  labels = [];
  value = 0;
  scale = 1;
  originalCalculateXLabelRotation = Chart.Scale.prototype.calculateXLabelRotation;
  data: any;
  blurb: '';
  constructor(
    public menu: MenuController,
    private route: ActivatedRoute,
    public router: Router,
    public storage: Storage,
    public pro: process
  ) {}

  startApp() {
    this.router.navigate(['/app/tabs/about/result/' + btoa(JSON.stringify(this.data))]);
  }

  private startLoading() {
    this.pro.load().subscribe((data: any) => {
      if (data) {
        this.blurb = data[Math.round(Math.random() * data.length)].text;
      }
    });
    this.addEmptyValues(this.values, this.samples);
    this.barChart = new Chart(this.barCanvas.nativeElement, {
      type: 'line',
      data: {
        // labels: labels,
        datasets: [{
          data: this.values,
          backgroundColor: 'rgba(255, 99, 132, 0.1)',
          borderColor: 'rgb(255, 99, 132)',
          borderWidth: 2,
          lineTension: 0.25,
          pointRadius: 0
        }]
      },
      options: {
        responsive: true,
        animation: {
          duration: this.speed * 1.5,
          easing: 'linear'
        },
        legend: false,
        scales: {
          xAxes: [{
            type: 'time',
            display: false
          }],
          yAxes: [{
            ticks: {
              max: 1,
              min: -1
            },
            display: false
          }]
        }
      }
    });
    this.advance();
    setTimeout(() => {
      this.startApp();
    }, this.timeout);
  }

  addEmptyValues(arr, n) {
    for (let i = 0; i < n; i++) {
      arr.push({
        x: moment().subtract((n - i) * this.speed, 'milliseconds').toDate(),
        y: null
      });
    }
  }
  rescale() {
    const padding = [];

    this.addEmptyValues(padding, 10);
    this.values.splice.apply(this.values, padding);

    this.scale++;
  }
  updateCharts() {
      this.barChart.update();
  }
  progress() {
    this.value = Math.min(Math.max(this.value + (0.1 - Math.random() / 5), -1), 1);
    this.values.push({
      x: new Date(),
      y: this.value
    });
    this.values.shift();
  }
  advance() {
    if (this.values) {
      if (this.values[0] !== null && this.scale < 4) {
        // this.rescale();
        this.updateCharts();
      }

      this.progress();
      this.updateCharts();

      setTimeout(() => {
        requestAnimationFrame(this.advance.bind(this));
      }, this.speed);
    }
  }

  ngOnInit(): void {
    this.startLoading();
    const stringRequest = atob(this.route.snapshot.paramMap.get('data'));
    const jsonRequest = JSON.parse(stringRequest);
    this.pro.getResult(stringRequest).subscribe((data: any) => {
      data.industry = jsonRequest.industry_description;
      data.region = jsonRequest.place_description;
      this.data = data;
      this.showSkip = true;
    });
  }
}
