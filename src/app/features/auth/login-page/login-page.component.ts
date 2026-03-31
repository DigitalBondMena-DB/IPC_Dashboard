import { Component, signal, inject } from '@angular/core';
import { LucideAngularModule, Mail, EyeOff, Eye } from 'lucide-angular';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { BCheckboxComponent } from '@shared/components/b-checkbox/b-checkbox.component';
import { CommonModule } from '@angular/common';
import { BInputComponent } from '@shared/components/b-input/b-input.component';
import { LoginService } from '../services/login.service';
import { ILoginData } from '../interfaces/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-page',
  imports: [
    CommonModule,
    LucideAngularModule,
    ReactiveFormsModule,
    BInputComponent,
    BCheckboxComponent,
  ],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css',
})
export class LoginPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(LoginService);
  private readonly _Router = inject(Router);
  readonly MailIcon = Mail;
  readonly EyeOffIcon = EyeOff;
  readonly EyeIcon = Eye;
  error = signal<string | null>(null);
  loginForm: FormGroup = this.fb.group({
    identity: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    remember_me: [false],
  });

  onSubmit() {
    if (this.loginForm.valid) {
      this.error.set('');
      this.authService.login(this.loginForm.value as ILoginData).subscribe({
        next: (response) => {
          this._Router.navigate(['/']);
        },
        error: (error) => {
          console.error(error);
          this.error.set(error.error.message);
        },
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  getErrorMessage(controlName: string): string | null {
    const control = this.loginForm.get(controlName);
    if (!control || !control.touched || !control.errors) return null;
    if (control.errors['required']) return 'This field is required';
    if (control.errors['identity']) return 'Invalid email format';
    if (control.errors['minlength'])
      return `Minimum length is ${control.errors['minlength'].requiredLength}`;

    return 'Invalid input';
  }

  isInvalid(controlName: string): boolean {
    const control = this.loginForm.get(controlName);
    return !!(control && control.touched && control.invalid);
  }
}
