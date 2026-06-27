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
import { OutreachService } from '../../core/services/outreach.service';
import { StartupOutreach } from '../../core/models/outreach.model';
import { OutreachDialogComponent } from './outreach-dialog/outreach-dialog.component';

@Component({
  selector: 'app-outreach',
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
  templateUrl: './outreach.component.html',
  styleUrl: './outreach.component.scss'
})
export class OutreachComponent implements OnInit {
  private outreachService = inject(OutreachService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  outreaches = signal<StartupOutreach[]>([]);
  totalOutreaches = signal(0);
  isLoading = signal(true);

  // Filters
  searchQuery = '';
  selectedResponseStatus = '';

  // Pagination
  pageSize = 10;
  currentPage = 1;

  displayedColumns: string[] = [
    'startupName',
    'founderName',
    'contactEmail',
    'emailSentDate',
    'responseStatus',
    'actions'
  ];

  ngOnInit() {
    this.loadOutreaches();
  }

  loadOutreaches() {
    this.isLoading.set(true);
    this.outreachService.getOutreaches(
      this.searchQuery,
      this.selectedResponseStatus,
      this.currentPage,
      this.pageSize
    ).subscribe({
      next: (res) => {
        if (res.success) {
          this.outreaches.set(res.data);
          this.totalOutreaches.set(res.total);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.snackBar.open('Failed to load outreach records', 'Close', { duration: 3000 });
      }
    });
  }

  onSearch() {
    this.currentPage = 1;
    this.loadOutreaches();
  }

  onFilterChange() {
    this.currentPage = 1;
    this.loadOutreaches();
  }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadOutreaches();
  }

  openAddDialog() {
    const dialogRef = this.dialog.open(OutreachDialogComponent, {
      width: '600px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.outreachService.createOutreach(result).subscribe({
          next: () => {
            this.snackBar.open('Outreach record created successfully!', 'Close', { duration: 3000 });
            this.loadOutreaches();
          },
          error: () => {
            this.snackBar.open('Failed to create outreach record', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  openEditDialog(outreach: StartupOutreach) {
    const dialogRef = this.dialog.open(OutreachDialogComponent, {
      width: '600px',
      data: { outreach }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.outreachService.updateOutreach(outreach._id!, result).subscribe({
          next: () => {
            this.snackBar.open('Outreach record updated successfully!', 'Close', { duration: 3000 });
            this.loadOutreaches();
          },
          error: () => {
            this.snackBar.open('Failed to update outreach record', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  deleteOutreach(outreach: StartupOutreach) {
    if (confirm(`Are you sure you want to delete outreach record for ${outreach.startupName}?`)) {
      this.outreachService.deleteOutreach(outreach._id!).subscribe({
        next: () => {
          this.snackBar.open('Outreach record deleted successfully!', 'Close', { duration: 3000 });
          this.loadOutreaches();
        },
        error: () => {
          this.snackBar.open('Failed to delete outreach record', 'Close', { duration: 3000 });
        }
      });
    }
  }

  getResponseStatusClass(status: string): string {
    switch (status) {
      case 'No Response': return 'status-no-response';
      case 'Replied - Interested': return 'status-interested';
      case 'Replied - Not Interested': return 'status-not-interested';
      default: return '';
    }
  }
}
