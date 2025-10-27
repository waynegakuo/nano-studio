import { ApplicationConfig, ErrorHandler, inject, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { ErrorService } from './services/core/error/error.service';
import { mapToFriendlyError } from './services/core/error/error-mapper';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
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
    }
  ]
};
