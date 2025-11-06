import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent implements OnInit {
model = { username: '', password: '' };
  loading = false;
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  submit(form: any) {
    this.error = '';
    if (!form.valid) return;
    this.loading = true;
    this.auth.signin(this.model).subscribe({
      next: () => {localStorage.removeItem("currentRoomId");
        this.router.navigate(['/']);},
      error: () => {
        this.loading = false;
        this.error = 'Invalid username or password';
      }
    });
  }

  goSignup() {
    this.router.navigate(['/signup']);
  }

  ngOnInit(): void {
  }

}
