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
import { DatePipe } from '@angular/common';
import { NetworkingService } from '../../core/services/networking.service';
import { LinkedInConnection } from '../../core/models/networking.model';
import { NetworkingDialogComponent } from './networking-dialog/networking-dialog.component';

@Component({
  selector: 'app-networking',
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
    MatSnackBarModule
  ],
  templateUrl: './networking.component.html',
  styleUrl: './networking.component.scss'
})
export class NetworkingComponent implements OnInit {
  private networkingService = inject(NetworkingService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  connections = signal<LinkedInConnection[]>([]);
  totalConnections = signal(0);
  isLoading = signal(true);

  // Filters
  searchQuery = '';
  selectedAccepted = '';
  selectedFollowUp = '';

  // Pagination
  pageSize = 10;
  currentPage = 1;

  displayedColumns: string[] = [
    'personName',
    'designation',
    'company',
    'connectionRequestDate',
    'accepted',
    'followUpSent',
    'actions'
  ];

  ngOnInit() {
    this.loadConnections();
  }

  loadConnections() {
    this.isLoading.set(true);
    this.networkingService.getConnections(
      this.searchQuery,
      this.selectedAccepted,
      this.selectedFollowUp,
      this.currentPage,
      this.pageSize
    ).subscribe({
      next: (res) => {
        if (res.success) {
          this.connections.set(res.data);
          this.totalConnections.set(res.total);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.snackBar.open('Failed to load connection requests', 'Close', { duration: 3000 });
      }
    });
  }

  onSearch() {
    this.currentPage = 1;
    this.loadConnections();
  }

  onFilterChange() {
    this.currentPage = 1;
    this.loadConnections();
  }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadConnections();
  }

  openAddDialog() {
    const dialogRef = this.dialog.open(NetworkingDialogComponent, {
      width: '600px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.networkingService.createConnection(result).subscribe({
          next: () => {
            this.snackBar.open('Contact added successfully!', 'Close', { duration: 3000 });
            this.loadConnections();
          },
          error: () => {
            this.snackBar.open('Failed to add contact', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  openEditDialog(connection: LinkedInConnection) {
    const dialogRef = this.dialog.open(NetworkingDialogComponent, {
      width: '600px',
      data: { connection }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.networkingService.updateConnection(connection._id!, result).subscribe({
          next: () => {
            this.snackBar.open('Contact updated successfully!', 'Close', { duration: 3000 });
            this.loadConnections();
          },
          error: () => {
            this.snackBar.open('Failed to update contact', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  deleteConnection(connection: LinkedInConnection) {
    if (confirm(`Are you sure you want to delete ${connection.personName} from your network list?`)) {
      this.networkingService.deleteConnection(connection._id!).subscribe({
        next: () => {
          this.snackBar.open('Contact deleted successfully!', 'Close', { duration: 3000 });
          this.loadConnections();
        },
        error: () => {
          this.snackBar.open('Failed to delete contact', 'Close', { duration: 3000 });
        }
      });
    }
  }

  // Quick Action: toggle acceptance state
  toggleAcceptance(connection: LinkedInConnection) {
    const updated = { ...connection, accepted: !connection.accepted };
    this.networkingService.updateConnection(connection._id!, updated).subscribe({
      next: () => {
        this.snackBar.open(`Status updated for ${connection.personName}!`, 'Close', { duration: 2000 });
        this.loadConnections();
      }
    });
  }

  // Quick Action: toggle follow up state
  toggleFollowUp(connection: LinkedInConnection) {
    const updated = { ...connection, followUpSent: !connection.followUpSent };
    this.networkingService.updateConnection(connection._id!, updated).subscribe({
      next: () => {
        this.snackBar.open(`Follow-up state updated for ${connection.personName}!`, 'Close', { duration: 2000 });
        this.loadConnections();
      }
    });
  }
}
