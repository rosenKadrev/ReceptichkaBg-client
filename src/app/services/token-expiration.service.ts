import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class TokenExpirationService {
    private router = inject(Router);
    private expirationTimeout: any;
    private onTokenExpiredCallback?: () => void;

    startTokenExpirationCheck(onTokenExpired?: () => void) {
        this.onTokenExpiredCallback = onTokenExpired;
        const token = localStorage.getItem('token');

        if (!token) {
            return;
        }

        const timeUntilExpiration = this.getTimeUntilExpiration(token);

        if (timeUntilExpiration <= 0) {
            this.handleTokenExpiration();
            return;
        }

        // Set timeout for exact expiration time
        this.expirationTimeout = setTimeout(() => {
            this.handleTokenExpiration();
        }, timeUntilExpiration);
    }

    stopTokenExpirationCheck() {
        if (this.expirationTimeout) {
            clearTimeout(this.expirationTimeout);
        }
    }

    private getTimeUntilExpiration(token: string): number {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expirationTime = payload.exp * 1000; // Convert to milliseconds
            const currentTime = Date.now();
            return expirationTime - currentTime;
        } catch {
            return 0;
        }
    }

    private handleTokenExpiration() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        if (this.onTokenExpiredCallback) {
            this.onTokenExpiredCallback();
        }

        this.router.navigate(['/login']);
        this.stopTokenExpirationCheck();
    }
}