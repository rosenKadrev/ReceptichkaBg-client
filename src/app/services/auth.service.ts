import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthResponse, DataResponse, LoginRequest, User } from '../store/models/data.models';
import { environment } from '../../config/env';


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl + '/auth';

  login(loginRequest: LoginRequest): Observable<DataResponse<AuthResponse>> {
    return this.http.post<DataResponse<AuthResponse>>(`${this.apiUrl}/login`, loginRequest);
  }

  signup(signupRequest: User): Observable<DataResponse<AuthResponse>> {
    return this.http.post<DataResponse<AuthResponse>>(`${this.apiUrl}/register`, signupRequest);
  }

  forgotPassword(email: string): Observable<DataResponse<{ message: string }>> {
    return this.http.post<DataResponse<{ message: string }>>(
      `${this.apiUrl}/forgot-password`,
      { email }
    );
  }

  resetPassword(data: { token: string; newPassword: string }): Observable<DataResponse<{ message: string }>> {
    return this.http.post<DataResponse<{ message: string }>>(
      `${this.apiUrl}/reset-password`,
      data
    );
  }
}
