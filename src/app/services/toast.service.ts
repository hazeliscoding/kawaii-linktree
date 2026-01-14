import { DestroyRef, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastState = 'show' | 'hide';

@Injectable()
export class ToastService {
  private readonly toastSubject = new BehaviorSubject<string | undefined>(undefined);
  private readonly toastStateSubject = new BehaviorSubject<ToastState>('hide');

  readonly toast$ = this.toastSubject.asObservable();
  readonly toastState$ = this.toastStateSubject.asObservable();

  private toastShowTimer?: number;
  private toastHideTimer?: number;

  constructor(destroyRef: DestroyRef) {
    destroyRef.onDestroy(() => {
      this.clearToastTimers();
    });
  }

  show(msg: string): void {
    this.clearToastTimers();

    this.toastSubject.next(msg);
    this.toastStateSubject.next('show');

    // Stay visible, then fade out, then remove.
    this.toastShowTimer = this.safeSetTimeout(() => {
      this.toastStateSubject.next('hide');

      this.toastHideTimer = this.safeSetTimeout(() => {
        this.toastSubject.next(undefined);
      }, 220);
    }, 1600);
  }

  private clearToastTimers(): void {
    if (this.toastShowTimer) {
      clearTimeout(this.toastShowTimer);
      this.toastShowTimer = undefined;
    }
    if (this.toastHideTimer) {
      clearTimeout(this.toastHideTimer);
      this.toastHideTimer = undefined;
    }
  }

  private safeSetTimeout(fn: () => void, ms: number): number {
    if (typeof window === 'undefined') {
      // Best effort for non-browser environments.
      fn();
      return 0;
    }

    return window.setTimeout(fn, ms);
  }
}
