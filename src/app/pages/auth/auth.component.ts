import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

/**
 * Authentication mode type for switching between views
 */
type AuthMode = 'signin' | 'signup';

/**
 * Interface for form validation state
 */
interface FormValidationState {
  readonly isValid: boolean;
  readonly isSubmitting: boolean;
  readonly errors: Record<string, string>;
}

/**
 * Interface for authentication form data
 */
interface AuthFormData {
  readonly email: string;
  readonly password: string;
  readonly confirmPassword?: string;
  readonly firstName?: string;
  readonly lastName?: string;
}

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css',
})
export class AuthComponent {
  // Authentication mode signal
  readonly authMode = signal<AuthMode>('signin');
  
  // Form submission state
  readonly isSubmitting = signal<boolean>(false);
  readonly showForgotPasswordForm = signal<boolean>(false);
  readonly isSubmittingForgotPassword = signal<boolean>(false);
  readonly forgotPasswordSuccess = signal<boolean>(false);
  
  // Form groups for both modes and forgot password
  readonly signinForm: FormGroup;
  readonly signupForm: FormGroup;
  readonly forgotPasswordForm: FormGroup;
  
  // Computed properties
  readonly isSigninMode = computed(() => this.authMode() === 'signin');
  readonly isSignupMode = computed(() => this.authMode() === 'signup');
  readonly currentForm = computed(() => 
    this.isSigninMode() ? this.signinForm : this.signupForm
  );
  
  // Form validation state
  readonly formValidation = computed<FormValidationState>(() => {
    const form = this.currentForm();
    return {
      isValid: form.valid,
      isSubmitting: this.isSubmitting(),
      errors: this.getFormErrors(form)
    };
  });

  constructor(private readonly fb: FormBuilder) {
    this.signinForm = this.createSigninForm();
    this.signupForm = this.createSignupForm();
    this.forgotPasswordForm = this.createForgotPasswordForm();
  }

  /**
   * Create sign-in form with validation
   */
  private createSigninForm(): FormGroup {
    return this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  /**
   * Create sign-up form with validation
   */
  private createSignupForm(): FormGroup {
    return this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      acceptTerms: [false, [Validators.requiredTrue]]
    }, { validators: this.passwordMatchValidator });
  }

  /**
   * Create forgot password form
   */
  private createForgotPasswordForm(): FormGroup {
    return this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  /**
   * Custom validator for password confirmation
   */
  private passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  /**
   * Extract form errors for display
   */
  private getFormErrors(form: FormGroup): Record<string, string> {
    const errors: Record<string, string> = {};
    
    Object.keys(form.controls).forEach(key => {
      const control = form.get(key);
      if (control && control.errors && control.touched) {
        if (control.errors['required']) {
          errors[key] = `${this.getFieldLabel(key)} is required`;
        } else if (control.errors['email']) {
          errors[key] = 'Please enter a valid email address';
        } else if (control.errors['minlength']) {
          const minLength = control.errors['minlength'].requiredLength;
          errors[key] = `${this.getFieldLabel(key)} must be at least ${minLength} characters`;
        } else if (control.errors['passwordMismatch']) {
          errors[key] = 'Passwords do not match';
        }
      }
    });
    
    return errors;
  }

  /**
   * Get user-friendly field labels
   */
  private getFieldLabel(fieldName: string): string {
    const labels: Record<string, string> = {
      firstName: 'First name',
      lastName: 'Last name',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm password',
      acceptTerms: 'Terms and conditions'
    };
    return labels[fieldName] || fieldName;
  }

  /**
   * Switch authentication mode
   */
  switchAuthMode(mode: AuthMode): void {
    this.authMode.set(mode);
    // Reset forms when switching modes
    this.signinForm.reset();
    this.signupForm.reset();
    // Hide forgot password form when switching modes
    this.showForgotPasswordForm.set(false);
    this.forgotPasswordSuccess.set(false);
  }

  /**
   * Show forgot password form
   */
  showForgotPassword(): void {
    this.showForgotPasswordForm.set(true);
    this.forgotPasswordSuccess.set(false);
  }

  /**
   * Hide forgot password form
   */
  hideForgotPassword(): void {
    this.showForgotPasswordForm.set(false);
    this.forgotPasswordForm.reset();
    this.forgotPasswordSuccess.set(false);
  }

  /**
   * Handle form submission
   */
  async onSubmit(): Promise<void> {
    const form = this.currentForm();
    
    if (form.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(form.controls).forEach(key => {
        form.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting.set(true);
    
    try {
      const formData = form.value as AuthFormData;
      
      if (this.isSigninMode()) {
        await this.handleSignin(formData);
      } else {
        await this.handleSignup(formData);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      // Handle error (show notification, etc.)
    } finally {
      this.isSubmitting.set(false);
    }
  }

  /**
   * Handle sign-in logic
   */
  private async handleSignin(data: AuthFormData): Promise<void> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('Sign in successful:', { email: data.email });
    // Navigate to dashboard or emit success event
  }

  /**
   * Handle sign-up logic
   */
  private async handleSignup(data: AuthFormData): Promise<void> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('Sign up successful:', { 
      email: data.email, 
      firstName: data.firstName,
      lastName: data.lastName 
    });
    // Navigate to dashboard or emit success event
  }

  /**
   * Handle forgot password form submission
   */
  async onForgotPasswordSubmit(): Promise<void> {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    this.isSubmittingForgotPassword.set(true);
    
    try {
      const email = this.forgotPasswordForm.value.email;
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Password reset email sent to:', email);
      this.forgotPasswordSuccess.set(true);
      this.showForgotPasswordForm.set(false);
      this.forgotPasswordForm.reset();
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        this.forgotPasswordSuccess.set(false);
      }, 5000);
      
    } catch (error) {
      console.error('Forgot password error:', error);
      // Handle error (show notification, etc.)
    } finally {
      this.isSubmittingForgotPassword.set(false);
    }
  }

  /**
   * Get field error message
   */
  getFieldError(fieldName: string): string {
    return this.formValidation().errors[fieldName] || '';
  }

  /**
   * Check if field has error
   */
  hasFieldError(fieldName: string): boolean {
    return !!this.formValidation().errors[fieldName];
  }
}