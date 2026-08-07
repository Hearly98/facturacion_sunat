import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { iconSubset } from './icons/icon-subset';
import { IconSetService } from '@coreui/icons-angular';
import { ToastContainerComponent } from './shared/alerts/toast/toast-container.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastContainerComponent],
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
