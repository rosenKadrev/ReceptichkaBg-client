import { Component, computed, effect, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSpinner } from '@angular/material/progress-spinner';
import { RecipeStore } from '../../../store/recipe.store';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton, MatAnchor } from '@angular/material/button';
import { Recipe, RecipeFilters } from '../../../store/models/data.models';
import { ActivatedRoute, Router } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { MatTooltip } from '@angular/material/tooltip';
import { MatDatepickerInputEvent, MatDatepickerModule } from '@angular/material/datepicker';

@Component({
    selector: 'app-approve-recipes',
    standalone: true,
    imports: [
        CommonModule,
        MatSpinner,
        MatFormFieldModule,
        MatTableModule,
        MatPaginatorModule,
        MatIcon,
        MatIconButton,
        MatInputModule,
        MatSelectModule,
        MatTooltip,
        MatDatepickerModule,
        MatAnchor
    ],
    templateUrl: './approve-recipes.component.html',
    styleUrls: ['./approve-recipes.component.scss'],
})
export class ApproveRecipesComponent {
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    public recipeStore = inject(RecipeStore);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    public segment = signal<string>('');
    public previousParams: RecipeFilters | null = null;
    public columnsToDisplay: string[] = ['name', 'createdBy', 'createdAt', 'category', 'typeOfProcessing', 'degreeOfDifficulty', 'status', 'actions'];
    public columnsToDisplayWithExpand: string[] = [...this.columnsToDisplay, 'expand'];
    public expandedRecipe: Recipe | null = null;
    public dateRange: { start: Date | null; end: Date | null } = { start: null, end: null };
    private searchTextSubject = new Subject<string>();
    private searchByNameSubject = new Subject<string>();
    public columnLabels = signal<Record<string, string>>({
        name: 'Име',
        createdBy: 'Създадена от',
        createdAt: 'Създадена на',
        category: 'Категория',
        typeOfProcessing: 'Начин на приготвяне',
        degreeOfDifficulty: 'Степен на трудност',
        status: 'Статус',
        actions: 'Действия',
        expand: ''
    });
    public getColumnLabel = computed(() => (column: string) =>
        this.columnLabels()[column] ?? column
    );
    public statusLabels = signal<Record<string, string>>({
        pending: 'В изчакване',
        active: 'Активна',
        rejected: 'Отхвърлена'
    });

    public getStatusLabel = computed(() => (status: string) =>
        this.statusLabels()[status] ?? status
    );

    constructor() {
        this.route.paramMap.subscribe(() => {
            const urlSegments = this.router.url.split('/');
            this.segment.set(urlSegments[urlSegments.length - 1]);
            this.recipeStore.setParams({
                ...this.recipeStore.params(),
                pageSize: 10,
            });
        });
        effect(() => {
            const currentParams = { ...this.recipeStore.params() };
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

    onApproveRecipe(recipeId: string) {
        this.recipeStore.approveRecipe(recipeId);
    }

    onRejectRecipe(recipeId: string) {
        this.recipeStore.rejectRecipe(recipeId);
    }

    onDeleteRecipe(recipeId: string) {
        this.recipeStore.adminDeleteRecipe(JSON.parse(JSON.stringify(recipeId)));
    }

    toggleSortOrder(column: string) {
        const params = this.recipeStore.params();
        if (params.sortBy === column) {
            this.recipeStore.setParams({
                ...params,
                sortOrder: params.sortOrder === 'asc' ? 'desc' : 'asc',
            });
        } else {
            this.recipeStore.setParams({
                ...params,
                sortBy: column,
                sortOrder: 'asc',
            });
        }
        this.onFilterChange();
    }

    onFilterChange(): void {
        this.paginator.pageIndex = 0;
        this.recipeStore.setParams({
            ...this.recipeStore.params(),
            currentPage: 1,
        });
    }

    onPageChange(event: PageEvent): void {
        this.recipeStore.setParams({
            ...this.recipeStore.params(),
            currentPage: event.pageIndex + 1,
            pageSize: event.pageSize,
        });
    }

    onSearchChange(column: string, value: string): void {
        if (column === 'name') {
            this.searchTextSubject.next(value);
        } else if (column === 'createdBy') {
            this.searchByNameSubject.next(value);
        }
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

    onDateRangeChange(event: MatDatepickerInputEvent<Date>): void {
        if (this.dateRange.start && this.dateRange.end) {
            this.dateRange = { start: null, end: null };
        }
        const input = event.targetElement as HTMLInputElement;
        if (input.getAttribute('matStartDate') !== null) {
            this.dateRange.start = event.value;
        }
        if (input.getAttribute('matEndDate') !== null) {
            this.dateRange.end = event.value;
        }

        if (this.dateRange.start && this.dateRange.end) {
            const startUtc = new Date(Date.UTC(
                this.dateRange.start.getFullYear(),
                this.dateRange.start.getMonth(),
                this.dateRange.start.getDate()
            ));
            const endUtc = new Date(Date.UTC(
                this.dateRange.end.getFullYear(),
                this.dateRange.end.getMonth(),
                this.dateRange.end.getDate(),
                23, 59, 59, 999
            ));

            this.recipeStore.setParams({
                ...this.recipeStore.params(),
                createdAtFrom: startUtc,
                createdAtTo: endUtc,
            });
            this.onFilterChange();
        }
    }

    onClearFilters(): void {
        this.paginator.pageIndex = 0;
        this.dateRange = { start: null, end: null };
        this.recipeStore.clearParams();
    }

    toggle(recipe: Recipe) {
        this.expandedRecipe = this.expandedRecipe === recipe ? null : recipe;
    }

    isExpanded(recipe: Recipe) {
        return this.expandedRecipe === recipe;
    }

    getHeaderFilterMaxWidthPx(column: string): number {
        switch (column) {
            case 'typeOfProcessing': return 180;
            case 'degreeOfDifficulty': return 170;
            case 'createdAt': return 250;
            case 'status': return 120;
            case 'actions': return 120;
            default: return 140;
        }
    }

    getSortTooltip(column: string): string {
        if (this.recipeStore.params().sortBy === column) {
            return this.recipeStore.params().sortOrder === 'asc'
                ? 'Сортиране във възходящ ред'
                : 'Сортиране в низходящ ред';
        }
        return 'Сортирай по тази колона';
    }
}