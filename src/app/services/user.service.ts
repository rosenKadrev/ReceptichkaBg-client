import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DataResponse, User, UserFilters } from '../store/models/data.models';
import { environment } from '../../config/env';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl + '/users';

  updateUser(userId: string, formData: FormData): Observable<DataResponse<User>> {
    return this.http.post<DataResponse<User>>(`${this.apiUrl}/${userId}`, formData);
  }

  getAllUsers(filters: UserFilters): Observable<DataResponse<{ users: User[]; totalResults: number }>> {
    let params = new HttpParams()
      .set('page', filters.currentPage.toString())
      .set('pageSize', filters.pageSize.toString());

    if (filters.name) params = params.set('name', filters.name);
    if (filters.email) params = params.set('email', filters.email);
    if (filters.gender) params = params.set('gender', filters.gender);
    if (filters.role) params = params.set('role', filters.role);
    if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params = params.set('sortOrder', filters.sortOrder);
    if (filters.createdAtFrom) params = params.set('createdAtFrom', filters.createdAtFrom.toISOString());
    if (filters.createdAtTo) params = params.set('createdAtTo', filters.createdAtTo.toISOString());

    return this.http.get<DataResponse<{ users: User[]; totalResults: number }>>(
      `${this.apiUrl}/all-users`,
      { params }
    );
  }

  promoteUserToAdmin(userId: string): Observable<DataResponse<User>> {
    return this.http.post<DataResponse<User>>(`${this.apiUrl}/${userId}/promote`, {});
  }

  demoteAdminToUser(userId: string): Observable<DataResponse<User>> {
    return this.http.post<DataResponse<User>>(`${this.apiUrl}/${userId}/demote`, {});
  }

  adminDeleteUser(userId: string): Observable<DataResponse<User>> {
    return this.http.delete<DataResponse<User>>(`${this.apiUrl}/${userId}`);
  }
}
