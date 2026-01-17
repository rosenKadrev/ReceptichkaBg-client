import { Component, inject, output } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';
import { UserStore } from '../../store/user.store';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    MatButton,
    MatIconButton,
    MatMenu,
    MatIcon,
    MatMenuItem,
    MatMenuTrigger
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  public sidenavToggle = output<void>();
  public userStore = inject(UserStore);
  private router = inject(Router);

  public onToggleSidenav() {
    this.sidenavToggle.emit();
  }

  logout(): void {
    this.userStore.logout();
    this.router.navigate(['/login']);
  }
}
