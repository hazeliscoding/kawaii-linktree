import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { SparkleCursorService } from './services/sparkle-cursor.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideAppInitializer(() => {
      // Side-effect: starts the cursor sparkle listeners.
      // This stays reduced-motion + touch safe inside the service.
      inject(SparkleCursorService);
    }),
    provideRouter(routes),
    provideHttpClient(),
  ],
};
