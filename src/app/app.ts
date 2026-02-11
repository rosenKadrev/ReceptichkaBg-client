import { Component, effect, inject } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './core/header/header.component';
import { FooterComponent } from './core/footer/footer.component';
import { SidenavComponent } from './core/sidenav/sidenav.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { FavoriteStore } from './store/favorite.store';
import { UserStore } from './store/user.store';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SidenavComponent, FooterComponent, HeaderComponent, MatSidenavModule, RouterModule, RouterOutlet],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})
export class App {
  private userStore = inject(UserStore);
  private favoriteStore = inject(FavoriteStore);

  constructor() {
    effect(() => {
      if (this.userStore.isLoggedIn()) {
        this.favoriteStore.loadFavorites();
      } else {
        this.favoriteStore.clearFavorites();
      }
    });
  }
}
