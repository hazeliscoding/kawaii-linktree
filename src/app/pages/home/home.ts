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

  private readonly configUrl = '/assets/site-config.json';

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private destroyRef: DestroyRef,
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.error = undefined;

    this.http
      .get<SiteConfig>(this.configUrl)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        }),
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
}