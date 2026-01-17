import { Routes } from '@angular/router';
import { authGuard } from '../../guards/auth.guard';
import { AddRecipeComponent } from './add-recipe/add-recipe.component';
import { RecipeDetailsComponent } from './recipe-details/recipe-details.component';
import { roleGuard } from '../../guards/role.guard';
import { ApproveRecipesComponent } from './approve-recipes/approve-recipes.component';
import { RecipesComponent } from './recipes/recipes.component';

export const RECIPE_ROUTES: Routes = [
  {
    path: 'all',
    component: RecipesComponent
  },
  {
    path: 'all/:id',
    component: RecipeDetailsComponent
  },
  {
    path: 'add',
    component: AddRecipeComponent,
    canActivate: [authGuard]
  },
  {
    path: 'edit/:id',
    component: AddRecipeComponent,
    canActivate: [authGuard]
  },
  {
    path: 'my',
    component: RecipesComponent,
    canActivate: [authGuard]
  },
  {
    path: 'my/:id',
    component: RecipeDetailsComponent,
    canActivate: [authGuard]
  },
  {
    path: 'admin',
    component: ApproveRecipesComponent,
    canActivate: [authGuard, roleGuard]
  },
  {
    path: '',
    redirectTo: 'all',
    pathMatch: 'full'
  }
];
