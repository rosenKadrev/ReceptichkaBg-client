import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserStore } from '../store/user.store';

export const roleGuard: CanActivateFn = (route, state) => {
    const userStore = inject(UserStore);
    const router = inject(Router);

    const allowedRoles = ['admin', 'superAdmin'];
    const userRole = userStore.user()?.role;
    let hasRole = false;

    if (userRole) {
        hasRole = allowedRoles.includes(userRole);
    }

    if (hasRole) {
        return true;
    }

    return router.createUrlTree(['/']);
};