import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';

import { routes } from './app.routes';
import { credentialsInterceptor } from './shared/services/credentials.interceptor';
import { authInterceptor }        from './shared/services/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withFetch(),
      withInterceptors([
        // 1. Always send the session cookie with every request
        credentialsInterceptor,
        // 2. On 401: attempt one session-restore then redirect to /sign-in
        authInterceptor,
      ]),
      withInterceptorsFromDi()
    ),
  ],
};
