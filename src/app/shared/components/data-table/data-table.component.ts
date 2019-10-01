import { Component, Input, OnInit } from '@angular/core';
import { Account, Strategy } from '@app/models';
import { TableHeaderRow } from '@app/models/table-header-row';

@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss']
})
export class DataTableComponent {
  @Input() tableHeader: TableHeaderRow[];
  @Input() data: Array<Strategy | Account>;
  @Input() totalFields: Array<string> = null;
  coloredFields: string[] = ['yield', 'totalProfit', 'account.intervalPnL'];

  constructor() { }

  getItemLink(item: any): string {
    let link: string = '';

    switch (true) {
      case (item instanceof Strategy):
        link = 'strategies/details';
        break;
      default:
        link = '';
    }

    return `/${link}/${item.id}`;
  }

  /**
   * Метод для отображения вложенных свойств объекта.
   * Например, если нужно отобразить вознаграждение для стратегии (strategy.offer.fee).
   * Тогда item - это стратегия, property - путь по вложенности до нужного свойства ('offer.fee')
   * @param item
   * @param {string} property
   * @returns {any}
   */
  getPropertyValue(item: any, property: string): any {
    const splittedPropertyName: string[] = property.split('.');

    let res = {};
    Object.assign(res, item);

    splittedPropertyName.forEach((key: string) => {
      if (typeof res[key] === 'object') {
        Object.assign(res, res[key]);
      } else {
        res = res[key];
      }
    });

    return res;
  }

  isTotal(field: string): boolean {
    return this.totalFields.includes(field);
  }

  getTotal(property: string): number {
    const splittedPropertyName: string[] = property.split('.');
    let sum: number = 0;

    if (!splittedPropertyName.length) {
      this.data.forEach((data: Strategy | Account) => {
        sum = sum + data[property];
      });
    } else {
      this.data.forEach((data: Strategy | Account) => {
        let nestedObj = {};
        Object.assign(nestedObj, data);

        splittedPropertyName.forEach((key: string) => {
          if (typeof nestedObj[key] === 'object') {
            Object.assign(nestedObj, nestedObj[key]);
          } else {
            sum = sum + nestedObj[key];
          }
        });
      });
    }

    return sum;
  }

  isColored(field: string): boolean {
    return this.coloredFields.includes(field);
  }
}
