import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Don't show snackbar for 401s, auth.interceptor handles them
      if (error.status !== 401) {
        let errorMsg = 'An unexpected error occurred';
        
        if (error.error instanceof ErrorEvent) {
          // Client side error
          errorMsg = `Error: ${error.error.message}`;
        } else if (error.error && error.error.message) {
          // Backend error object
          errorMsg = error.error.message;
        } else if (error.statusText) {
          // Standard HTTP error
          errorMsg = `${error.status} ${error.statusText}`;
        }

        snackBar.open(errorMsg, 'Close', {
          duration: 4000
        });
      }
      return throwError(() => error);
    })
  );
};
