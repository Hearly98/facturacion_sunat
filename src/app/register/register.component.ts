import { Component, inject, signal } from '@angular/core';
import { IconDirective } from '@coreui/icons-angular';
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  SpinnerComponent
} from '@coreui/angular';
import { buildRegisterForm, passwordsMatchValidator, registerStructure } from './helpers';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { AuthService } from '../core/auth/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { GlobalNotification } from '@shared/alerts/global-notification/global-notification';
import { MenuOptionsNavService } from '../menu-options/services/menu-options-nav.service';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  imports: [
    CardComponent,
    CardBodyComponent,
    IconDirective,
    ButtonDirective,
    ReactiveFormsModule,
    SpinnerComponent,
    RouterLink,
  ]
})
export class RegisterComponent {
  public registerStructure = registerStructure();
  public form!: FormGroup;
  public globalNotification = inject(GlobalNotification);
  public isLoading = signal(false);
  public visiblePasswords = signal<Set<string>>(new Set());
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly menuOptionsNavService = inject(MenuOptionsNavService);

  constructor() {
    this.createForm();
  }

  private createForm() {
    this.form = this.fb.group(buildRegisterForm(), { validators: passwordsMatchValidator });
  }

  isPasswordVisible(fieldName: string): boolean {
    return this.visiblePasswords().has(fieldName);
  }

  togglePasswordVisibility(fieldName: string) {
    this.visiblePasswords.update((current) => {
      const next = new Set(current);
      next.has(fieldName) ? next.delete(fieldName) : next.add(fieldName);
      return next;
    });
  }

  onRegister() {
    if (this.form.invalid) return;

    this.isLoading.set(true);
    this.authService.register(this.form.value).pipe(
      switchMap(() => {
        return this.menuOptionsNavService.loadUserPermissions();
      })
    ).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('Register error', err);
        this.globalNotification.openToastAlert(
          'Error',
          err.error?.message || 'Error al crear la cuenta',
          'danger');
      }
    });
  }
}
