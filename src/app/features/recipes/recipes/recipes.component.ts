import { Component, effect, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecipeStore } from '../../../store/recipe.store';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButton } from '@angular/material/button';
import {
  MatCard,
  MatCardActions,
  MatCardContent,
  MatCardHeader,
  MatCardSubtitle,
  MatCardTitle,
} from '@angular/material/card';
import { MatSpinner } from '@angular/material/progress-spinner';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { MatTooltip } from '@angular/material/tooltip';
import { MatFormField } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatIcon } from '@angular/material/icon';
import { RecipeFilters } from '../../../store/models/data.models';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { UserStore } from '../../../store/user.store';

@Component({
  selector: 'app-recipes',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButton,
    MatCard,
    MatCardHeader,
    MatCardContent,
    MatCardActions,
    MatCardTitle,
    MatCardSubtitle,
    MatSpinner,
    MatPaginatorModule,
    MatTooltip,
    MatFormField,
    MatInputModule,
    MatSelect,
    MatOption,
    MatIcon,
  ],
  templateUrl: './recipes.component.html',
  styleUrls: ['./recipes.component.scss'],
})
export class RecipesComponent {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  public recipeStore = inject(RecipeStore);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private searchTextSubject = new Subject<string>();
  private searchByNameSubject = new Subject<string>();
  public showFilters = false;
  public previousParams: RecipeFilters | null = null;
  public segment = signal<string>('');
  public userStore = inject(UserStore);

  constructor() {
    this.route.paramMap.subscribe(() => {
      const urlSegments = this.router.url.split('/');
      this.segment.set(urlSegments[urlSegments.length - 1]);
    });
    effect(() => {
      const currentParams = this.recipeStore.params();
      if ((JSON.stringify(this.previousParams) !== JSON.stringify(currentParams)) && this.segment()) {
        this.previousParams = currentParams;
        this.recipeStore.loadRecipes({ params: currentParams, segment: this.segment() });
      }
    });
  }

  ngOnInit(): void {
    this.recipeStore.loadLookups();
    this.searchTextSubject.pipe(debounceTime(500), distinctUntilChanged()).subscribe((searchValue) => {
      this.recipeStore.setParams({
        ...this.recipeStore.params(),
        searchText: searchValue,
      });
      this.onFilterChange();
    });

    this.searchByNameSubject.pipe(debounceTime(500), distinctUntilChanged()).subscribe((searchValue) => {
      this.recipeStore.setParams({
        ...this.recipeStore.params(),
        searchByName: searchValue,
      });
      this.onFilterChange();
    });
  }

  ngOnDestroy(): void {
    this.searchTextSubject.complete();
    this.searchByNameSubject.complete();
    this.recipeStore.clearParams();
    this.recipeStore.clearRecipes();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  onFilterChange(): void {
    this.paginator.pageIndex = 0;
    this.recipeStore.setParams({
      ...this.recipeStore.params(),
      currentPage: 1,
    });
  }

  clearFilters(): void {
    this.paginator.pageIndex = 0;
    this.recipeStore.clearParams();
  }

  onSearchTextChange(value: string): void {
    this.searchTextSubject.next(value);
  }

  onSearchByNameChange(value: string): void {
    this.searchByNameSubject.next(value);
  }

  onStatusChange(status: string): void {
    this.recipeStore.setParams({
      ...this.recipeStore.params(),
      status: status,
    });
    this.onFilterChange();
  }

  onCategoryChange(categoryId: string): void {
    this.recipeStore.setParams({
      ...this.recipeStore.params(),
      categoryId: categoryId,
    });
    this.onFilterChange();
  }

  onProcessingTypeChange(processingTypeId: string): void {
    this.recipeStore.setParams({
      ...this.recipeStore.params(),
      typeOfProcessingId: processingTypeId,
    });
    this.onFilterChange();
  }

  onDifficultyChange(difficulty: string): void {
    this.recipeStore.setParams({
      ...this.recipeStore.params(),
      degreeOfDifficultyId: difficulty,
    });
    this.onFilterChange();
  }

  onPageChange(event: PageEvent): void {
  console.log(event);
  
    this.recipeStore.setParams({
      ...this.recipeStore.params(),
      currentPage: event.pageIndex + 1,
      pageSize: event.pageSize,
    });
  }

  onSortChange(sortBy: string): void {
    if (this.recipeStore.params().sortBy === sortBy) {
      this.recipeStore.setParams({
        ...this.recipeStore.params(),
        sortOrder: this.recipeStore.params().sortOrder === 'asc' ? 'desc' : 'asc',
      });
    } else {
      this.recipeStore.setParams({
        ...this.recipeStore.params(),
        sortBy: sortBy,
        sortOrder: 'desc',
      });
    }
    this.onFilterChange();
  }

  toggleSortOrder(): void {
    this.recipeStore.setParams({
      ...this.recipeStore.params(),
      sortOrder: this.recipeStore.params().sortOrder === 'asc' ? 'desc' : 'asc',
    });
    if (!this.recipeStore.params().sortBy) {
      this.recipeStore.setParams({
        ...this.recipeStore.params(),
        sortBy: 'createdAt',
      });
    }
    this.onFilterChange();
  }

  async onDeleteRecipe(recipeId: string): Promise<void> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      data: {
        title: 'Изтриване на рецепта',
        message: 'Сигурни ли сте, че искате да изтриете тази рецепта? Това действие е необратимо.',
        confirmText: 'Изтрий',
        cancelText: 'Отказ',
      },
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result === 'true') {
        await this.recipeStore.deleteRecipe(recipeId);
      }
    });

  }

  getStatusText(status: string): string {
    switch (status) {
      case 'pending':
        return 'В изчакване';
      case 'active':
        return 'Активна';
      case 'rejected':
        return 'Отхвърлена';
      default:
        return status;
    }
  }
}
