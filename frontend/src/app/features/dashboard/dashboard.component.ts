import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DashboardService } from '../../core/services/dashboard.service';
import { AuthService } from '../../core/services/auth.service';
import { DashboardSummary } from '../../core/models/dashboard.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  currentUser = this.authService.currentUser;
  summary = signal<DashboardSummary | null>(null);
  isLoading = signal(true);
  isEditingTargets = signal(false);

  targetsForm: FormGroup = this.fb.group({
    applications: [10, [Validators.required, Validators.min(0)]],
    outreach: [20, [Validators.required, Validators.min(0)]],
    connections: [10, [Validators.required, Validators.min(0)]]
  });

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.isLoading.set(true);
    this.dashboardService.getSummary().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.summary.set(res.data);
          this.targetsForm.setValue({
            applications: res.data.targets.applications,
            outreach: res.data.targets.outreach,
            connections: res.data.targets.connections
          });
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.snackBar.open('Failed to load dashboard statistics', 'Close', { duration: 3000 });
      }
    });
  }

  toggleEditTargets() {
    this.isEditingTargets.update(v => !v);
  }

  saveTargets() {
    if (this.targetsForm.invalid) return;

    this.authService.updateTargets(this.targetsForm.value).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.snackBar.open('Daily targets updated successfully!', 'Close', { duration: 3000 });
          this.isEditingTargets.set(false);
          this.loadDashboardData();
        }
      },
      error: () => {
        this.snackBar.open('Failed to update daily targets', 'Close', { duration: 3000 });
      }
    });
  }

  // Calculate percentages for progress bars
  calcPercent(val: number, target: number): number {
    if (!target) return 0;
    return Math.min(Math.round((val / target) * 100), 100);
  }
}
