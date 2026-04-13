import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = () => {

  const router = inject(Router);

  if (typeof window === 'undefined') {
    return false;
  }

  const token = localStorage.getItem('accessToken');

  if (token) {
    return true;
  }

  router.navigate(['/login']);
  return false;

};