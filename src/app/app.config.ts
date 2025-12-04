import {
  ApplicationConfig,
  ErrorHandler,
  inject,
  isDevMode,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { environment } from '../environments/environment.development';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { ErrorService } from './services/core/error/error.service';
import { mapToFriendlyError } from './services/core/error/error-mapper';
import { getAnalytics, provideAnalytics } from '@angular/fire/analytics';
import { connectFunctionsEmulator, getFunctions, provideFunctions } from '@angular/fire/functions';

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
    provideFunctions(() => {
      const functions = getFunctions(app, 'africa-south1');
      if (isDevMode() && environment.emulator) {
        console.log(`Connecting to Functions emulator on ${environment.emulator.host}:${environment.emulator.functionsPort}`);
        connectFunctionsEmulator(functions, environment.emulator.host, environment.emulator.functionsPort);
      }
      return functions;
    }),
    provideAnalytics(() => getAnalytics()),
  ]
};
