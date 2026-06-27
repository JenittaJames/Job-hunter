import { Component, OnInit, inject, signal } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { DatePipe, NgClass } from '@angular/common';
import { JobService } from '../../core/services/job.service';
import { JobApplication } from '../../core/models/job.model';
import { JobDialogComponent } from './job-dialog/job-dialog.component';

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [
    FormsModule,
    DatePipe,
    MatDialogModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatTableModule,
    MatPaginatorModule,
    MatSnackBarModule,
    NgClass
  ],
  templateUrl: './jobs.component.html',
  styleUrl: './jobs.component.scss'
})
export class JobsComponent implements OnInit {
  private jobService = inject(JobService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  jobs = signal<JobApplication[]>([]);
  totalJobs = signal(0);
  isLoading = signal(true);

  // Search & Filter state
  searchQuery = '';
  selectedStatus = '';
  selectedSource = '';

  // Pagination state
  pageSize = 10;
  currentPage = 1;

  displayedColumns: string[] = [
    'companyName',
    'jobTitle',
    'appliedDate',
    'applicationSource',
    'status',
    'actions'
  ];

  ngOnInit() {
    this.loadJobs();
  }

  loadJobs() {
    this.isLoading.set(true);
    this.jobService.getJobs(
      this.searchQuery,
      this.selectedStatus,
      this.selectedSource,
      this.currentPage,
      this.pageSize
    ).subscribe({
      next: (res) => {
        if (res.success) {
          this.jobs.set(res.data);
          this.totalJobs.set(res.total);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.snackBar.open('Failed to load job applications', 'Close', { duration: 3000 });
      }
    });
  }

  onSearch() {
    this.currentPage = 1;
    this.loadJobs();
  }

  onFilterChange() {
    this.currentPage = 1;
    this.loadJobs();
  }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadJobs();
  }

  openAddDialog() {
    const dialogRef = this.dialog.open(JobDialogComponent, {
      width: '600px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.jobService.createJob(result).subscribe({
          next: () => {
            this.snackBar.open('Job application added successfully!', 'Close', { duration: 3000 });
            this.loadJobs();
          },
          error: () => {
            this.snackBar.open('Failed to add job application', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  openEditDialog(job: JobApplication) {
    const dialogRef = this.dialog.open(JobDialogComponent, {
      width: '600px',
      data: { job }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.jobService.updateJob(job._id!, result).subscribe({
          next: () => {
            this.snackBar.open('Job application updated successfully!', 'Close', { duration: 3000 });
            this.loadJobs();
          },
          error: () => {
            this.snackBar.open('Failed to update job application', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  deleteJob(job: JobApplication) {
    if (confirm(`Are you sure you want to delete application for ${job.jobTitle} at ${job.companyName}?`)) {
      this.jobService.deleteJob(job._id!).subscribe({
        next: () => {
          this.snackBar.open('Job application deleted successfully!', 'Close', { duration: 3000 });
          this.loadJobs();
        },
        error: () => {
          this.snackBar.open('Failed to delete job application', 'Close', { duration: 3000 });
        }
      });
    }
  }

  // Get status class for styling
  getStatusClass(status: string): string {
    switch (status) {
      case 'Applied': return 'status-applied';
      case 'Interview Scheduled': return 'status-interview';
      case 'Technical Round': return 'status-tech';
      case 'HR Round': return 'status-hr';
      case 'Rejected': return 'status-rejected';
      case 'Offer': return 'status-offer';
      default: return '';
    }
  }
}
