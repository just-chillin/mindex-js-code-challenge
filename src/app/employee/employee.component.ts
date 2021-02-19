import {Component, Input, OnInit, Output} from '@angular/core';

import {Employee} from '../employee';
import {EmployeeService} from '../employee.service';
import {Observable, of, pipe, Subscriber} from 'rxjs';
import {fromArray} from 'rxjs/internal/observable/fromArray';
import {concatAll, exhaust, expand, filter, map, mapTo, mergeScan, skip} from 'rxjs/operators';
import {visit} from '@angular/compiler-cli/src/ngtsc/util/src/visitor';

const employee_cache = new Map<number, Employee>();

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css'],
})
export class EmployeeComponent implements OnInit {
  @Input() employee: Employee;
  directReports: Employee[] = [];
  totalReports = 0;

  constructor(private employeeService: EmployeeService) {
  }

  onEditClicked(emp: Employee) {

  }

  onDeleteClicked(emp: Employee) {

  }

  private async initReports(): Promise<[Employee[], number]> {
    // BFS for employees who report to the employee owned by this component
    const visited = new Set<number>();
    const directReports = [];
    let totalReports = 0;
    const todo = [];
    for (const subordinate_id of this.employee.directReports) {
      let child = this.employeeService.get(subordinate_id);
      if (child instanceof Observable) {
        child = await child.toPromise();
      }
      directReports.push(child);
    }
    for (let node = this.employee; node !== undefined; node = todo.shift()) {
      visited.add(node.id);
      for (const child_id of (node.directReports ?? [])) {
        if (visited.has(child_id)) {
          continue;
        }
        // Value is cached in employee.service.ts so we aren't doing O(N^2) api calls.
        let child = this.employeeService.get(child_id);
        if (child instanceof Observable) {
          child = await child.toPromise();
        }
        todo.push(child);
      }
      totalReports++;
    }
    return [directReports, totalReports];
  }

  ngOnInit(): void {
    this.initReports().then(result => ([this.directReports, this.totalReports] = result));
  }
}
