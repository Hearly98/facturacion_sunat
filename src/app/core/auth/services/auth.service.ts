import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthResponse, User } from '../models/auth.models';
import { LoginForm } from 'src/app/login/core/types/login-form';
import { BaseService } from '../../../shared/services/base.service';
import { ResponseDto } from '@shared/models/api/response.dto';

@Injectable({
  providedIn: 'root',
})
export class AuthService extends BaseService {
  private readonly router = inject(Router);
  private readonly TOKEN_KEY = 'factu_token';
  private readonly USER_KEY = 'factu_user';

  // State
  private readonly _user = signal<User | null>(null);
  public user = this._user.asReadonly();
  public isAuthenticated = computed(() => !!this._user() || !!this.getToken());

  constructor(http: HttpClient) {
    super(http, `${environment.apiUrl}/auth`);

    const token = this.getToken();
    const storedUser = localStorage.getItem(this.USER_KEY);

    if (token && storedUser) {
      try {
        this._user.set(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem(this.USER_KEY);
        console.error(e);
      }
    }
  }

  login(body: LoginForm): Observable<ResponseDto<AuthResponse>> {
    return this.postRequest<LoginForm, ResponseDto<AuthResponse>>('/login', body).pipe(
      tap((res) => {
        this.setToken(res.data.access_token);
        this.setUser(res.data.user);
      }),
    );
  }

  register(data: any): Observable<AuthResponse> {
    return this.postRequest<any, AuthResponse>('/register', data).pipe(
      tap((res) => {
        this.setToken(res.access_token);
        this.setUser(res.user);
      }),
    );
  }

  logout(): Observable<any> {
    return this.postRequest<{}, any>('/logout', {}).pipe(
      tap(() => this.logoutLocal()),
      catchError((err) => {
        this.logoutLocal();
        return throwError(() => err);
      }),
    );
  }

  getUser(): Observable<User> {
    return this.getRequest<User>('/me').pipe(tap((user) => this.setUser(user)));
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  private setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this._user.set(user);
  }

  logoutLocal(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    sessionStorage.removeItem('menuConfig');
    this._user.set(null);
    document.body.classList.remove('dark');
    this.router.navigate(['/login']);
  }
}
