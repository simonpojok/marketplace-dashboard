import {HttpErrorResponse, HttpInterceptorFn, HttpRequest} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { EMPTY, Observable, catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../../auth/services/auth.service';
import { ToastService } from '../../services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastService = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Check if the error is due to token expiration and not a login attempt
        if (!req.url.includes('/login') && !req.url.includes('/refresh')) {
          // Try to refresh the token
          return handleUnauthorized(authService, req, next);
        }
      }

      if (error.status === 403) {
        toastService.error('You do not have permission to access this resource');
        router.navigate(['/dashboard']);
      }

      // Server error
      if (error.status === 500) {
        toastService.error('Server error. Please try again later or contact support.');
      }

      // Network error
      if (error.status === 0) {
        toastService.error('Unable to connect to the server. Please check your internet connection.');
      }

      return throwError(() => error);
    })
  );
};

function handleUnauthorized(
  authService: AuthService,
  req: HttpRequest<any>,
  next: any
): Observable<any> {
  // Try to refresh the token
  return authService.refreshToken().pipe(
    switchMap(() => {
      // Retry the request with the new token
      const token = authService.getAccessToken();
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next(authReq);
    }),
    catchError((refreshError) => {
      // If refresh fails, logout and redirect to login
      authService.logout().subscribe();
      return EMPTY;
    })
  );
}
