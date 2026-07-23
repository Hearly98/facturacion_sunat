import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import {
  AvatarComponent,
  BreadcrumbRouterComponent,
  ColorModeService,
  ContainerComponent,
  DropdownComponent,
  DropdownHeaderDirective,
  DropdownItemDirective,
  DropdownMenuDirective,
  DropdownToggleDirective,
  HeaderComponent,
  HeaderNavComponent,
  HeaderTogglerDirective,
  SidebarToggleDirective,
} from '@coreui/angular';

import { IconDirective } from '@coreui/icons-angular';
import { AuthService } from '../../../core/auth/services/auth.service';

@Component({
  selector: 'app-default-header',
  templateUrl: './default-header.component.html',
  imports: [
    ContainerComponent,
    HeaderTogglerDirective,
    SidebarToggleDirective,
    IconDirective,
    HeaderNavComponent,
    RouterLink,
    NgTemplateOutlet,
    BreadcrumbRouterComponent,
    DropdownComponent,
    DropdownToggleDirective,
    AvatarComponent,
    DropdownMenuDirective,
    DropdownHeaderDirective,
    DropdownItemDirective,
  ],
})
export class DefaultHeaderComponent extends HeaderComponent {
  readonly #colorModeService = inject(ColorModeService);
  readonly #authService = inject(AuthService);
  readonly colorMode = this.#colorModeService.colorMode;
  public user = this.#authService.user;

  readonly colorModes = [
    { name: 'light', text: 'Light', icon: 'cilSun' },
    { name: 'dark', text: 'Dark', icon: 'cilMoon' },
    { name: 'auto', text: 'Auto', icon: 'cilContrast' },
  ];

  readonly icons = computed(() => {
    const currentMode = this.colorMode();
    return this.colorModes.find((mode) => mode.name === currentMode)?.icon ?? 'cilSun';
  });

  readonly initials = computed(() => {
    const name = this.user()?.name?.trim();
    if (!name) return '?';
    const parts = name.split(/\s+/);
    return parts.length === 1
      ? parts[0].slice(0, 2).toUpperCase()
      : (parts[0][0] + parts[1][0]).toUpperCase();
  });

  constructor() {
    super();
  }

  logout() {
    this.#authService.logout().subscribe();
  }

  sidebarId = input('sidebar1');
}
