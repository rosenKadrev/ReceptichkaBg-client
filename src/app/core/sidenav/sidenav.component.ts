import { Component, inject, output } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserStore } from '../../store/user.store';


@Component({
    standalone: true,
    imports: [MatIcon, MatListModule, RouterModule, CommonModule],
    selector: 'app-sidenav',
    templateUrl: './sidenav.component.html',
    styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent {
    public closeSidenav = output<void>();
    public userStore = inject(UserStore);

    public onClose() {
        this.closeSidenav.emit();
    }
}
