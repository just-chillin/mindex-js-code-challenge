import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {from, Observable, throwError} from 'rxjs';
import {catchError, flatMap, mapTo} from 'rxjs/operators';

import {Employee} from './employee';

@Injectable()
export class EmployeeService {
  private url = '/api/employees';

  private cache = new Map<number, Employee>();

  constructor(private http: HttpClient) {
  }

  getAll(): Observable<Employee> {
    return this.http.get<Employee[]>(this.url)
      .pipe(
        flatMap(emps => {
          emps.forEach(emp => this.cache.set(emp.id, emp));
          return from(emps);
        }),
        catchError(this.handleError)
      );
  }

  get(id: number): Observable<Employee> | Employee {
    if (this.cache.has(id)) {
      return this.cache.get(id);
    }
    const result = this.http.get<Employee>(`${this.url}/${id}`)
      .pipe(catchError(this.handleError));
    result.toPromise().then(emp => this.cache.set(id, emp));

    return result;
  }

  save(emp: Employee): Observable<Employee> {
    const response = (!!emp.id) ? this.put(emp) : this.post(emp);
    return response.pipe(catchError(this.handleError));
  }

  remove(emp: Employee): Observable<never> {
    return this.http
      .delete<never>(`${this.url}/${emp.id}`)
      .pipe(catchError(this.handleError));
  }

  private post(emp: Employee): Observable<Employee> {
    return this.http.post<Employee>(this.url, emp);
  }

  private put(emp: Employee): Observable<Employee> {
    return this.http.put<Employee>(`${this.url}/${emp.id}`, emp);
  }

  private handleError(res: HttpErrorResponse | any): Observable<never> {
    return throwError(res.error || 'Server error');
  }
}
