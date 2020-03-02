import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChartOptions, Strategy } from '@app/models';
import * as Highcharts from 'highcharts';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/internal/operators';
import { DataService } from '@app/services/data.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-strategy-details-profitability',
  templateUrl: './strategy-details-profitability.component.html',
  styleUrls: ['./strategy-details-profitability.component.scss']
})
export class StrategyDetailsProfitabilityComponent implements OnInit , OnDestroy {
  // https://blog.strongbrew.io/rxjs-best-practices-in-angular/#avoiding-memory-leaks
  // here we will unsubscribe from all subscriptions
  destroy$ = new Subject();

  // component data
  strategy: Strategy;
  chartOptions: any;
  args: any;

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService,
    private translateService: TranslateService
  ) { }

  ngOnInit(): void {
    this.args = {
      strategyId: this.route.parent.params['_value'].id
    };
    this.translateService.onDefaultLangChange
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        Highcharts.chart('yieldChartContainer', this.chartOptions);
      });

    this.dataService.getStrategy(this.args)
      .pipe(takeUntil(this.destroy$))
      .subscribe((strategy: Strategy) => {
        this.strategy = strategy;
        console.log(strategy);
      });

    this.dataService.getStrategyChart(new ChartOptions(this.route.parent.params['_value'].id))
      .pipe(takeUntil(this.destroy$))
      .subscribe(response => {

        this.chartOptions = {
          credits: {
            enabled: false
          },
          chart: {
            zoomType: 'x',
            backgroundColor: '#f8f8f8'
          },
          title: {
            text: ''
          },
          xAxis: {
            type: 'datetime',
            dateTimeLabelFormats: {
              day: '%e<br>%b',
              month: '%y<br>%b'
            },
            gridLineWidth: 1,
            gridLineColor: '#eaeaea'
          },
          yAxis: {
            labels: {
              format: '{value}%'
            },
            title: {
              text: ''
            },
            gridLineWidth: 1,
            gridLineColor: '#eaeaea'
          },
          legend: {
            enabled: false
          },
          plotOptions: {
            series: {
              marker: {
                enabled: false
              }
            }
          },
          tooltip: {
            backgroundColor: '#ffffff',
            useHTML: true,
            formatter: function() {
              return `<div class="arearange-tooltip-header ${this.y < 0 ? 'negative' : ''} ${this.y > 0 ? 'positive' : ''}">` +
                `${Highcharts.numberFormat((this.y), 2, '.')}%</div>` +
                `<div>${Highcharts.dateFormat('%A, %e %b %Y, %H:%M', this.x)}</div>`;
            }
          },
          type: 'arearange',
          series: [{
            type: 'area',
            lineWidth: 1,
            data: this.getChartDataValues(response.Chart),
            zones: [{
              value: 0,
              color: '#ec151d',
              fillColor: 'rgba(236, 21, 29, .1)'
            }, {
              color: '#00a651',
              fillColor: 'rgba(0, 166, 81, .1'
            }]
          }]
        };

        Highcharts.chart('yieldChartContainer', this.chartOptions);
      });
  }

  getChartDataValues(chartData: any[]) {
    const data: object[] = [];
    chartData.forEach(d => data.push([new Date(d.DT).getTime(), d.Yield]));
    return data;
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
  }
}