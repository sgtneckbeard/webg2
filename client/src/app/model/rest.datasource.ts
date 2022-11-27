import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Book } from './book.model';
import { Order } from './order.model';
import { JwtHelperService } from '@auth0/angular-jwt';
import { User } from './user.model';
import { map } from "rxjs/operators";


const PROTOCOL = 'http';
const PORT = 3500;



@Injectable()
export class RestDataSource {
  user: User;
  baseUrl: string;
  authToken: string;

  private httpOptions =
    {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
      })
    };

  constructor(private http: HttpClient,
    private jwtService: JwtHelperService) {
    this.user = new User();
    this.baseUrl = `${PROTOCOL}://${location.hostname}:${PORT}/`;
  }

  getBooks(): Observable<Book[]> {
    // go to book-list and return books from backend
    return this.http.get<Book[]>(this.baseUrl + 'book-list');
  }

  saveOrder(order: Order): Observable<Order> {
    console.log(JSON.stringify(order));
    return this.http.post<Order>(this.baseUrl + 'orders/add', order);
  }

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.baseUrl + 'orders');
  }

  authenticate(user: string, pass: string): Observable<boolean> {
    return this.http.post<any>(this.baseUrl + "login", {
      name: user, password: pass
    }).pipe(map(response => {
      this.authToken = response.success ? response.token : null;

      // temporary solution!!!!!
      this.user.displayName = user;
      this.storeUserData(response.token, this.user)

      return response.success;
    }));
  }

  register(user: User): Observable<any> {
    return this.http.post(this.baseUrl + 'register', user, this.httpOptions);
  }

  storeUserData(token: any, user: User): void {
    localStorage.setItem('id_token', 'Bearer' + token);
    localStorage.setItem('user', JSON.stringify(user));
    this.authToken = token;
    this.user = user;
  }

  logout(): Observable<any> {
    this.authToken = null!;
    this.user = null!;
    localStorage.clear();
    return this.http.get<any>(this.baseUrl + 'logout', this.httpOptions);
  }

  loggedIn(): boolean {
    return !this.jwtService.isTokenExpired(this.authToken);
  }

  private loadToken(): void {
    const token = localStorage.getItem('id_token');
    this.authToken = token;
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', this.authToken);
  }
}

