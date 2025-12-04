import {
  ApplicationConfig, ErrorHandler, inject, PLATFORM_ID, provideBrowserGlobalErrorListeners, provideZoneChangeDetection,
  provideZonelessChangeDetection
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { ErrorService } from './services/core/error/error.service';
import { mapToFriendlyError } from './services/core/error/error-mapper';
import { getAnalytics, provideAnalytics } from '@angular/fire/analytics';

const app = initializeApp(environment.firebaseConfig);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    {
      provide: ErrorHandler,
      useFactory: () => ({
        handleError: (err: unknown) => {
          // Log full technical details for developers
          console.error(err);
          // Show a simple, user-friendly message
          const errorService = inject(ErrorService);
          errorService.showError(mapToFriendlyError(err));
        }
      } as ErrorHandler)
    },
    provideFirebaseApp(() => app),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideAnalytics(() => getAnalytics()),
  ]
};
