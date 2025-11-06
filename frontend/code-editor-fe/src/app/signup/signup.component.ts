import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

   model = {
    username: '',
    password: '',
    confirmPassword: '',
    displayName: ''
  };

  loading = false;
  error = '';
  passwordMismatch = false;

  constructor(private auth: AuthService, private router: Router) {}

  submit(form: any) {
    this.error = '';
    this.passwordMismatch = this.model.password !== this.model.confirmPassword;
    if (this.passwordMismatch || !form.valid) return;

    this.loading = true;
    this.auth.signup({
      username: this.model.username.trim(),
      password: this.model.password,
      displayName: this.model.displayName?.trim()
    }).subscribe({
      next: () => {
        localStorage.removeItem("currentRoomId");
        // On success, route to main app (editor)
        this.router.navigate(['/']);
      },
      error: (e) => {
        this.loading = false;
        if (e?.status === 409) {
          this.error = 'Username already exists. Please choose another.';
        } else {
          this.error = 'Sign up failed. Please try again.';
        }
      }
    });
  }

  ngOnInit(): void {
  }

}
