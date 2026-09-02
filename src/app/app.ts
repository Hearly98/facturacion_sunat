import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { iconSubset } from './icons/icon-subset';
import { IconSetService } from '@coreui/icons-angular';
import { ToastContainerComponent } from './shared/alerts/toast/toast-container.component';
import { GlobalLoadingBarComponent } from './shared/components/global-loading-bar/global-loading-bar.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastContainerComponent, GlobalLoadingBarComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('factu-front');
  readonly #iconSetService = inject(IconSetService);

  constructor() {
    this.#iconSetService.icons = { ...iconSubset };
  }
}
