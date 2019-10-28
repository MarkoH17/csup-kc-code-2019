import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';

import {ActivatedRoute, Router} from '@angular/router';

import { Chart } from 'chart.js';
import { process } from '../../providers/process';

@Component({
  selector: 'page-result-detail',
  styleUrls: ['./result-detail.scss'],
  templateUrl: 'result-detail.html'
})
export class SessionDetailPage implements OnInit {
  @ViewChild('doughnutCanvas', {static: true}) doughnutCanvas: ElementRef;
  @ViewChild('lineCanvas', {static: true}) lineCanvas: ElementRef;
  private barChart: Chart;
  private doughnutChart: Chart;
  private lineChart: Chart;
  defaultHref = '';
  public results;
  private postData: any;
  // values
  public region = '';
  public industry = '';
  public ratingAvg: any;
  public ratingRadius: any;
  public ratingArea: any;
  public trendSlope: any;
  public relatedTopics = [];
  public relatedTrendingTopics = [];

  constructor(
      private route: ActivatedRoute,
      private router: Router,
      public pro: process
  ) {
  }

  ionViewWillEnter() {
        this.postData = JSON.parse(atob(this.route.snapshot.paramMap.get('data')));
        this.loadLargeCharts();
        this.initValues();
  }
  ionViewDidEnter() {
    this.defaultHref = `/app/tabs/about`;
  }

  ngOnInit(): void {
  }

  private initValues() {
    this.industry = decodeURI(this.postData.industry);
    this.region = decodeURI(this.postData.region);
    this.ratingAvg = decodeURI(this.postData.rating.ratingAvg);
    this.ratingRadius = decodeURI(this.postData.rating.ratingRadius);
    this.ratingRadius = this.ratingRadius / 1000;
    this.ratingArea = Math.round(Math.pow(this.ratingRadius, 2) * 3.14);
    this.trendSlope = decodeURI(this.postData.trend.trendSlope);
    this.relatedTopics = this.postData.trend.relatedTopics;
    this.relatedTrendingTopics = this.postData.trend.relatedTrendingTopics;
  }

  private loadLargeCharts() {
    Chart.pluginService.register({
      beforeDraw: function (chart) {
        if (chart.config.options.elements.center) {
          //Get ctx from string
          var ctx = chart.chart.ctx;

          //Get options from the center object in options
          var centerConfig = chart.config.options.elements.center;
          var fontStyle = centerConfig.fontStyle || 'Arial';
          var txt = centerConfig.text;
          var color = centerConfig.color || '#000';
          var sidePadding = centerConfig.sidePadding || 20;
          var sidePaddingCalculated = (sidePadding/100) * (chart.innerRadius * 2)
          //Start with a base font of 30px
          ctx.font = "30px " + fontStyle;

          //Get the width of the string and also the width of the element minus 10 to give it 5px side padding
          var stringWidth = ctx.measureText(txt).width;
          var elementWidth = (chart.innerRadius * 2) - sidePaddingCalculated;

          // Find out how much the font can grow in width.
          var widthRatio = elementWidth / stringWidth;
          var newFontSize = Math.floor(30 * widthRatio);
          var elementHeight = (chart.innerRadius * 2);

          // Pick a new font size so it will not be larger than the height of label.
          var fontSizeToUse = Math.min(newFontSize, elementHeight);

          //Set font settings to draw it correctly.
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          var centerX = ((chart.chartArea.left + chart.chartArea.right) / 2);
          var centerY = ((chart.chartArea.top + chart.chartArea.bottom) / 2);
          ctx.font = fontSizeToUse+"px " + fontStyle;
          ctx.fillStyle = color;

          //Draw text in center
          ctx.fillText(txt, centerX, centerY);
        }
      }
    });
    const doughnutChartData = [];
    doughnutChartData.push(100 - this.postData.result);
    doughnutChartData.push(this.postData.result);
    this.doughnutChart = new Chart(this.doughnutCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Smart Score', ''],
        datasets: [
          {
            label: '',
            data: doughnutChartData,
            backgroundColor: [
              'rgba(255,255,255,0)',
              'rgba(66,140,255,0.6)'
            ],
            hoverBackgroundColor: [
                'rgba(255,255,255,0)',
                'rgba(66,140,255,0.8)'
            ],
            borderWidth: 0
          }
        ]
      },
      options: {
        responsive: true,
        animation: {
          duration: 1.5,
          animateRotate: true
        },
        cutoutPercentage: 70,
        legend: false,
        elements: {
          center: {
            text: Math.round(this.postData.result),
            color: '#36A2EB', //Default black
            fontStyle: 'Helvetica', //Default Arial
            sidePadding: 15 //Default 20 (as a percentage)
          }
        }
      }
    });

    const lineData = [];
    const labels = [];
    let count = 0;
    this.postData.trend.trendSeriesData.forEach((arr) => {
      lineData.push(arr[1]);
      labels.push(count);
      count++;
    });
    this.lineChart = new Chart(this.lineCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: '',
            fill: false,
            lineTension: 0.1,
            backgroundColor: 'rgba(66,140,255,0.6)',
            borderColor: 'rgba(66,140,255,1)',
            borderCapStyle: 'butt',
            borderDash: [],
            borderDashOffset: 0.0,
            borderJoinStyle: 'miter',
            pointBorderColor: 'rgba(66,140,255,1)',
            pointBackgroundColor: '#fff',
            pointBorderWidth: 1,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: 'rgba(66,140,255,1)',
            pointHoverBorderColor: 'rgba(220,220,220,1)',
            pointHoverBorderWidth: 2,
            pointRadius: 0,
            pointHitRadius: 0,
            data: lineData,
            spanGaps: false
          }
        ]
      },
      options: {
        responsive: true,
        animation: {
          duration: 1000,
          easing: 'linear'
        },
        legend: false,
        scales: {
          xAxes: [{
            display: false
          }],
          yAxes: [{
            display: false
          }]
        }
      }
    });
  }
}
