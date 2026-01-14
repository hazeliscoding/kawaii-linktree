import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, DestroyRef, OnInit } from '@angular/core';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SiteConfig } from '../../types/site-config';
import { LinkItem } from '../../types/link-item';
import { SiteConfigService } from '../../services/site-config.service';
import { ThemeService } from '../../services/theme.service';
import { ToastService, ToastState } from '../../services/toast.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
  providers: [ToastService],
})
export class Home implements OnInit {
  config?: SiteConfig;
  loading = true;
  error?: string;
  theme: 'light' | 'dark' = 'light';
  toast?: string;
  toastState: ToastState = 'hide';

  constructor(
    private siteConfig: SiteConfigService,
    private themeService: ThemeService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
    private destroyRef: DestroyRef
  ) {}

  ngOnInit(): void {
    this.themeService.init();
    this.theme = this.themeService.theme;

    this.themeService.theme$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((theme) => {
        this.theme = theme;
        this.cdr.detectChanges();
      });

    this.toastService.toast$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((toast) => {
        this.toast = toast;
        this.cdr.detectChanges();
      });

    this.toastService.toastState$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((toastState) => {
        this.toastState = toastState;
        this.cdr.detectChanges();
      });

    this.loading = true;
    this.error = undefined;

    this.siteConfig
      .load()
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
          this.error = `Could not load ${this.siteConfig.configUrl}`;
        },
      });
  }

  toggleTheme(): void {
    this.themeService.toggle();
  }

  async onLinkClick(event: MouseEvent, link: LinkItem) {
    if (link.copyText) {
      event.preventDefault();

      try {
        await navigator.clipboard.writeText(link.copyText);
        this.showToast('Copied ✨');
      } catch {
        this.showToast('Copy failed');
      }
    }
  }

  showToast(msg: string) {
    this.toastService.show(msg);
  }
}
