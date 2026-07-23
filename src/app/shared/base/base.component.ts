import { Inject, OnDestroy, ViewContainerRef } from "@angular/core";
// rxjs
import { Observable, Subscription } from "rxjs";
import * as objectPath from "object-path";
import { PERMISSIONS } from "../../core/config/permissions/permissions";
const DEFAULT_DELAY = 5000;

@Inject("BaseComponent")
export abstract class BaseComponent implements OnDestroy {
  public PERMISSIONS: Record<string, string>;
  protected viewContainerRef: ViewContainerRef;
  protected subscriptions: Subscription[] = [];

  constructor(
    module: string,
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef,
  ) {
    this.viewContainerRef = viewContainerRef;
    this.PERMISSIONS = objectPath.get(PERMISSIONS, module) ?? {};
  }

  ngOnDestroy(): void {
    if (this.subscriptions) {
      try {
        this.subscriptions.forEach((el) => el.unsubscribe());
      } catch (err) {
        console.error(err);
      }
    }
  }


  fetchData<T>(
    serviceCall: Observable<{ isValid: boolean; data: T[] }>,
    targetArray: T[]
  ): void {
    const subscription = serviceCall.subscribe({
      next: (response) => {
        if (response.isValid) {
          targetArray.length = 0;
          targetArray.push(...response.data);
        }
      },
      error: (error) => {
        console.error(error);
      },
    });

    this.subscriptions.push(subscription);
  }

  fetchById<T>(
    serviceCall: Observable<{ isValid: boolean; data: T }>,
    target: (data: T) => void
  ): void {
    const subscription = serviceCall.subscribe({
      next: (response) => {
        if (response.isValid) {
          target(response.data);
        }
      },
      error: (error) => {
        console.error(error);
      },
    });

    this.subscriptions.push(subscription);
  }
}
