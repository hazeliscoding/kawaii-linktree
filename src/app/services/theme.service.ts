import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storageKey = 'kawaii-linktree-theme';

  private readonly themeSubject = new BehaviorSubject<Theme>('light');
  readonly theme$ = this.themeSubject.asObservable();

  get theme(): Theme {
    return this.themeSubject.value;
  }

  constructor(@Inject(DOCUMENT) private document: Document) {}

  init(): void {
    const saved = this.safeGetItem(this.storageKey);
    if (saved === 'light' || saved === 'dark') {
      this.setTheme(saved, false);
      return;
    }

    const prefersDark =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;

    this.setTheme(prefersDark ? 'dark' : 'light', false);
  }

  toggle(): void {
    this.setTheme(this.theme === 'light' ? 'dark' : 'light');
  }

  setTheme(theme: Theme, persist = true): void {
    this.themeSubject.next(theme);

    if (this.document?.documentElement) {
      this.document.documentElement.setAttribute('data-theme', theme);
    }

    if (persist) {
      this.safeSetItem(this.storageKey, theme);
    }
  }

  private safeGetItem(key: string): string | null {
    try {
      if (typeof localStorage === 'undefined') return null;
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  private safeSetItem(key: string, value: string): void {
    try {
      if (typeof localStorage === 'undefined') return;
      localStorage.setItem(key, value);
    } catch {
      // ignore (storage may be blocked)
    }
  }
}
