import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const guestGuard: CanActivateFn = () => {

  const router = inject(Router);

  if (typeof window === 'undefined') {
    return true;
  }

  const token = localStorage.getItem('accessToken');

  if (!token) {
    return true;
  }

  router.navigate(['/home']);
  return false;

};