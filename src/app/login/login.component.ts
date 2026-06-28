import { Component, inject, signal } from '@angular/core';
import { IconDirective } from '@coreui/icons-angular';
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  SpinnerComponent
} from '@coreui/angular';
import { buildLoginForm, loginStructure } from './helpers';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { AuthService } from '../core/auth/services/auth.service';
import { Router } from '@angular/router';
import { GlobalNotification } from '@shared/alerts/global-notification/global-notification';
import { MenuOptionsNavService } from '../menu-options/services/menu-options-nav.service';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  imports: [
    CardComponent,
    CardBodyComponent,
    IconDirective,
    ButtonDirective,
    ReactiveFormsModule,
    SpinnerComponent,
  ]
})
export class LoginComponent {
  public loginStructure = loginStructure();
  public form!: FormGroup;
  public globalNotification = inject(GlobalNotification);
  public isLoading = signal(false);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private menuOptionsNavService = inject(MenuOptionsNavService);

  constructor() {
    this.createForm();
    this.updateStructure();
  }

  private updateStructure() {
    this.loginStructure.title = 'Bienvenido';
    this.loginStructure.description = 'Inicia sesión para acceder al sistema';
    this.loginStructure.forms[0].placeholder = 'correo@empresa.com';
    this.loginStructure.forms[0].icon = 'cilEnvelopeOpen';
    this.loginStructure.forms[1].placeholder = '••••••••';
  }

  private createForm() {
    this.form = this.fb.group(buildLoginForm());
  }

  onLogin() {
    if (this.form.invalid) return;

    this.isLoading.set(true);
    this.authService.login(this.form.value).pipe(
      switchMap(() => {
        // Cargar permisos después del login exitoso
        return this.menuOptionsNavService.loadUserPermissions();
      })
    ).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('Login error', err);
        this.globalNotification.openToastAlert(
          'Error',
          err.message || 'Error al iniciar sesión',
          'danger');
      }
    });
  }
}
