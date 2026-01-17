import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { NotFoundComponent } from './features/not-found/not-found.component';
import { LoginComponent } from './features/auth/login/login.component';
import { SignupComponent } from './features/auth/signup/signup.component';
import { authGuard } from './guards/auth.guard';
import { ProfileComponent } from './features/profile/profile.component';
import { roleGuard } from './guards/role.guard';
import { UsersComponent } from './features/users/users.component';
import { PasswordResetComponent } from './features/auth/password-reset/password-reset.component';
import { AddArticleComponent } from './features/article-categories/add-article/add-article.component';

export const routes: Routes = [
    {
        path: '',
        component: HomeComponent,
    },
    {
        path: 'recipes',
        loadChildren: () => import('./features/recipes/recipes.routes').then((m) => m.RECIPE_ROUTES),
    },
    {
        path: 'article-categories',
        loadChildren: () => import('./features/article-categories/articles.routes').then(m => m.ARTICLES_ROUTES)
    },
    {
        path: 'login',
        component: LoginComponent,
    },
    {
        path: 'signup',
        component: SignupComponent,
    },
    {
        path: 'users',
        component: UsersComponent,
        canActivate: [authGuard, roleGuard]
    },
    {
        path: 'not-found',
        component: NotFoundComponent,
    },
    {
        path: 'profile/:id',
        component: ProfileComponent,
        canActivate: [authGuard],
    },
    {
        path: 'password-reset',
        component: PasswordResetComponent
    },
    {
        path: 'add-article',
        component: AddArticleComponent,
        canActivate: [authGuard, roleGuard]
    },
    {
        path: 'edit-article/:id',
        component: AddArticleComponent,
        canActivate: [authGuard, roleGuard]
    },
    {
        path: '**',
        redirectTo: 'not-found',
        pathMatch: 'full',
    },
];
