import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../core/services/auth.service';
import { map } from 'rxjs';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatMenuModule
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {
  authService = inject(AuthService);
  private breakpointObserver = inject(BreakpointObserver);

  currentUser = this.authService.currentUser;
  isHandset = toSignal(
    this.breakpointObserver.observe('(max-width: 959px)').pipe(map(result => result.matches)),
    { initialValue: false }
  );

  menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: '/jobs', label: 'Applications', icon: 'work' },
    { path: '/outreach', label: 'Startup Outreach', icon: 'send' },
    { path: '/networking', label: 'LinkedIn Networking', icon: 'people' },
    { path: '/followups', label: 'Follow-Up Center', icon: 'notifications_active' },
    { path: '/analytics', label: 'Analytics', icon: 'bar_chart' }
  ];

  logout() {
    this.authService.logout();
  }
}
