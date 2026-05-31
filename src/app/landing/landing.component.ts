import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
})
export class LandingComponent {
  @ViewChild('demoSection') demoSection!: ElementRef;

  demoForm: FormGroup;
  demoFormSubmitted = false;
  demoFormSuccess = false;

  constructor(private fb: FormBuilder) {
    this.demoForm = this.fb.group({
      companyName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
    });
  }

  scrollToDemo() {
    if (this.demoSection) {
      this.demoSection.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  onDemoSubmit() {
    this.demoFormSubmitted = true;
    if (this.demoForm.valid) {
      // TODO: Replace with actual API call
      console.log('Demo request:', this.demoForm.value);
      this.demoFormSuccess = true;
      this.demoForm.reset();
      this.demoFormSubmitted = false;

      // Reset success message after 5 seconds
      setTimeout(() => {
        this.demoFormSuccess = false;
      }, 5000);
    }
  }

  get companyName() {
    return this.demoForm.get('companyName');
  }

  get email() {
    return this.demoForm.get('email');
  }

  get phone() {
    return this.demoForm.get('phone');
  }
}
