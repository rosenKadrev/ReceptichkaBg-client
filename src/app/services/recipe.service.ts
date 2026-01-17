import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DataResponse, Recipe, RecipeFilters, RecipeLookups } from '../store/models/data.models';

@Injectable({
  providedIn: 'root',
})
export class RecipeService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/recipes';

  createRecipe(recipeData: FormData): Observable<DataResponse<Recipe>> {
    return this.http.post<DataResponse<Recipe>>(`${this.apiUrl}/add`, recipeData);
  }

  updateRecipe(id: string, recipeData: FormData): Observable<DataResponse<Recipe>> {
    return this.http.post<DataResponse<Recipe>>(`${this.apiUrl}/${id}`, recipeData);
  }

  getLookups(): Observable<DataResponse<RecipeLookups>> {
    return this.http.get<DataResponse<RecipeLookups>>(`${this.apiUrl}/lookups`);
  }

  getMyRecipeById(id: string, segment: string): Observable<{ data: Recipe }> {
    return this.http.get<{ data: Recipe }>(`${this.apiUrl}/${segment}/${id}`);
  }

  getRecipeById(id: string, segment: string): Observable<{ data: Recipe }> {
    return this.http.get<{ data: Recipe }>(`${this.apiUrl}/${segment}/${id}`);
  }

  getRecipes(
    filters: RecipeFilters, segment: string
  ): Observable<DataResponse<{ recipes: Recipe[]; totalResults: number }>> {
    let params = new HttpParams()
      .set('page', filters.currentPage.toString())
      .set('pageSize', filters.pageSize.toString());

    if (filters.searchText) params = params.set('searchText', filters.searchText);
    if (filters.searchByName) params = params.set('searchByName', filters.searchByName);
    if (filters.createdAtFrom) params = params.set('createdAtFrom', filters.createdAtFrom.toISOString());
    if (filters.createdAtTo) params = params.set('createdAtTo', filters.createdAtTo.toISOString());
    if (filters.status) params = params.set('status', filters.status);
    if (filters.categoryId) params = params.set('categoryId', filters.categoryId);
    if (filters.typeOfProcessingId)
      params = params.set('typeOfProcessingId', filters.typeOfProcessingId);
    if (filters.degreeOfDifficultyId)
      params = params.set('degreeOfDifficultyId', filters.degreeOfDifficultyId);
    if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params = params.set('sortOrder', filters.sortOrder);

    return this.http.get<DataResponse<{ recipes: Recipe[]; totalResults: number }>>(
      `${this.apiUrl}/${segment}`,
      { params }
    );
  }

  deleteRecipe(id: string): Observable<DataResponse<{ recipe: Recipe; totalResults: number }>> {
    return this.http.delete<DataResponse<{ recipe: Recipe; totalResults: number }>>(
      `${this.apiUrl}/${id}`
    );
  }

  adminDeleteRecipe(id: string): Observable<DataResponse<{ recipe: Recipe }>> {
    return this.http.delete<DataResponse<{ recipe: Recipe }>>(
      `${this.apiUrl}/${id}/admin-delete`
    );
  }

  getRandomRecipes(count: number): Observable<DataResponse<Recipe[]>> {
    return this.http.get<DataResponse<Recipe[]>>(`${this.apiUrl}/random-recipes`, {
      params: { count: count.toString() },
    });
  }

  approveRecipe(id: string): Observable<DataResponse<Recipe>> {
    return this.http.post<DataResponse<Recipe>>(`${this.apiUrl}/${id}/approve`, {});
  }

  rejectRecipe(id: string): Observable<DataResponse<Recipe>> {
    return this.http.post<DataResponse<Recipe>>(`${this.apiUrl}/${id}/reject`, {});
  }
}
