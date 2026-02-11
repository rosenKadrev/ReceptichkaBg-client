import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../config/env';
import { DataResponse, FavoritesParams, Recipe } from '../store/models/data.models';

@Injectable({
    providedIn: 'root'
})
export class FavoriteService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/favorites`;

    getUserFavorites(): Observable<DataResponse<string[]>> {
        return this.http.get<DataResponse<string[]>>(`${this.apiUrl}`);
    }

    addFavorite(recipeId: string): Observable<DataResponse<void>> {
        return this.http.post<DataResponse<void>>(`${this.apiUrl}/${recipeId}`, {});
    }

    removeFavorite(recipeId: string): Observable<DataResponse<void>> {
        return this.http.delete<DataResponse<void>>(`${this.apiUrl}/${recipeId}`);
    }

    getFavoriteRecipes(params: FavoritesParams): Observable<DataResponse<{ recipes: Recipe[]; totalResults: number }>> {
        return this.http.post<DataResponse<{ recipes: Recipe[]; totalResults: number }>>(`${this.apiUrl}/recipes`, params);
    }
}