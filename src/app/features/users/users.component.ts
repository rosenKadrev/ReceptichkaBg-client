import { Component, computed, effect, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserStore } from '../../store/user.store';
import { User, UserFilters } from '../../store/models/data.models';
import { MatSpinner } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { MatDatepickerInputEvent, MatDatepickerModule } from '@angular/material/datepicker';
import { MatTooltip } from '@angular/material/tooltip';
import { MatAnchor, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';


@Component({
    selector: 'app-users',
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
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.scss'],
})
export class UsersComponent {
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    public userStore = inject(UserStore);
    public previousParams: UserFilters | null = null;
    private searchNameSubject = new Subject<string>();
    private searchEmailSubject = new Subject<string>();
    public dateRange: { start: Date | null; end: Date | null } = { start: null, end: null };
    public columnsToDisplay: string[] = ['name', 'email', 'gender', 'dateCreated', 'role', 'actions'];
    public expandedUser: User | null = null;
    public columnLabels = signal<Record<string, string>>({
        name: 'Име',
        email: 'Имейл',
        gender: 'Пол',
        dateCreated: 'Дата на създаване',
        role: 'Роля',
        actions: 'Действия'
    });
    public getColumnLabel = computed(() => (column: string) =>
        this.columnLabels()[column] ?? column
    );
    private roleLabels = signal<Record<string, string>>({
        superAdmin: 'Супер администратор',
        admin: 'Администратор',
        user: 'Потребител'
    });
    public getRoleLabel = computed(() => (role: string) =>
        this.roleLabels()[role] ?? role
    );
    private genderLabels = signal<Record<string, string>>({
        male: 'Мъж',
        female: 'Жена'
    });
    public getGenderLabel = computed(() => (gender: string) =>
        this.genderLabels()[gender] ?? gender
    );

    constructor() {
        effect(() => {
            const currentParams = { ...this.userStore.params() };
            if ((JSON.stringify(this.previousParams) !== JSON.stringify(currentParams))) {
                this.previousParams = currentParams;
                this.userStore.getAllUsers(currentParams);
            }
        });
    }

    ngOnInit(): void {
        this.searchNameSubject.pipe(debounceTime(500), distinctUntilChanged()).subscribe((searchValue) => {
            this.userStore.setParams({
                ...this.userStore.params(),
                name: searchValue,
            });
            this.onFilterChange();
        });

        this.searchEmailSubject.pipe(debounceTime(500), distinctUntilChanged()).subscribe((searchValue) => {
            this.userStore.setParams({
                ...this.userStore.params(),
                email: searchValue,
            });
            this.onFilterChange();
        });
    }

    ngOnDestroy(): void {
        this.searchNameSubject.complete();
        this.searchEmailSubject.complete();
        this.userStore.clearParams();
        this.userStore.clearUsers();
    }

    onPromoteUserToAdmin(userId: string) {
        this.userStore.promoteUserToAdmin(userId);
    }

    onDemoteAdminToUser(userId: string) {
        this.userStore.demoteAdminToUser(userId);
    }

    onDeleteUser(userId: string) {
        this.userStore.adminDeleteUser(userId);
    }

    toggleSortOrder(column: string) {
        const params = this.userStore.params();
        if (params.sortBy === column) {
            this.userStore.setParams({
                ...params,
                sortOrder: params.sortOrder === 'asc' ? 'desc' : 'asc',
            });
        } else {
            this.userStore.setParams({
                ...params,
                sortBy: column,
                sortOrder: 'asc',
            });
        }
        this.onFilterChange();
    }

    onFilterChange(): void {
        this.paginator.pageIndex = 0;
        this.userStore.setParams({
            ...this.userStore.params(),
            currentPage: 1,
        });
    }

    onPageChange(event: PageEvent): void {
        this.userStore.setParams({
            ...this.userStore.params(),
            currentPage: event.pageIndex + 1,
            pageSize: event.pageSize,
        });
    }

    onSearchChange(column: string, value: string): void {
        if (column === 'name') {
            this.searchNameSubject.next(value);
        } else if (column === 'email') {
            this.searchEmailSubject.next(value);
        }
    }

    onGenderChange(gender: string): void {
        this.userStore.setParams({
            ...this.userStore.params(),
            gender: gender,
        });
        this.onFilterChange();
    }

    onRoleChange(role: string): void {
        this.userStore.setParams({
            ...this.userStore.params(),
            role: role,
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

            this.userStore.setParams({
                ...this.userStore.params(),
                createdAtFrom: startUtc,
                createdAtTo: endUtc,
            });
            this.onFilterChange();
        }
    }

    onClearFilters(): void {
        this.paginator.pageIndex = 0;
        this.dateRange = { start: null, end: null };
        this.userStore.clearParams();
    }

    getSortTooltip(column: string): string {
        if (this.userStore.params().sortBy === column) {
            return this.userStore.params().sortOrder === 'asc'
                ? 'Сортиране във възходящ ред'
                : 'Сортиране в низходящ ред';
        }
        return 'Сортирай по тази колона';
    }

    getHeaderFilterMaxWidthPx(column: string): number {
        switch (column) {
            case 'dateCreated': return 250;
            case 'role': return 160;
            case 'actions': return 120;
            default: return 140;
        }
    }

    onClick() {
        console.log('clicked');
        this.userStore.getAllUsers(this.userStore.params());

    }
}