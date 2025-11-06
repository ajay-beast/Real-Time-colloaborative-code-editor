import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { CollabServiceService } from './services/collab-service.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent  implements OnInit{
  title = 'code-editor-fe';
    constructor(
    private router: Router,
    private auth: AuthService,
    private collab: CollabServiceService
  ) {}

  ngOnInit(): void {
    window.addEventListener('storage', (e: StorageEvent) => {
      if (e.key === 'logout') {
        // Another tab logged out: clean up and redirect here too
        // try { this.collab.disconnect?.(); } catch {}
        // Ensure local state is cleared (idempotent)
        localStorage.removeItem('jwt');
        localStorage.removeItem('user');
        this.auth['auth$']?.next(false);
        this.router.navigate(['/signin']);
      }

      if (e.key === 'login') {
      // Another tab logged in: pick up credentials here
      this.auth['auth$']?.next(true);
      this.router.navigate(['/']);
      // window.location.reload();
    }
    });
  }
}
