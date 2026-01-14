import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, DestroyRef, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SiteConfig } from '../../types/site-config';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  config?: SiteConfig;
  loading = true;
  error?: string;
  theme: 'light' | 'dark' = 'light';

  private readonly configUrl = '/assets/site-config.json';
  private readonly themeStorageKey = 'kawaii-linktree-theme';

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private destroyRef: DestroyRef
  ) {}

  ngOnInit(): void {
    this.initTheme();

    this.loading = true;
    this.error = undefined;

    this.http
      .get<SiteConfig>(this.configUrl)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (cfg) => {
          this.config = cfg;
        },
        error: () => {
          this.error = `Could not load ${this.configUrl}`;
        },
      });
  }

  toggleTheme(): void {
    this.setTheme(this.theme === 'light' ? 'dark' : 'light');
  }

  private initTheme(): void {
    const saved = this.safeGetItem(this.themeStorageKey);
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

  private setTheme(theme: 'light' | 'dark', persist = true): void {
    this.theme = theme;

    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }

    if (persist) {
      this.safeSetItem(this.themeStorageKey, theme);
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
