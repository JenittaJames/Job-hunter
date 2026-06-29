import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { FollowUpService } from '../../core/services/followup.service';
import { JobService } from '../../core/services/job.service';
import { OutreachService } from '../../core/services/outreach.service';
import { NetworkingService } from '../../core/services/networking.service';
import { FollowUp, FollowUpResponseData } from '../../core/models/followup.model';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-followups',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    DatePipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  templateUrl: './followups.component.html',
  styleUrl: './followups.component.scss'
})
export class FollowupsComponent implements OnInit {
  private followUpService = inject(FollowUpService);
  private jobService = inject(JobService);
  private outreachService = inject(OutreachService);
  private networkingService = inject(NetworkingService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  followUps = signal<FollowUpResponseData | null>(null);
  isLoading = signal(true);
  isAddingCustom = signal(false);

  customForm: FormGroup = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    dueDate: [new Date().toISOString().substring(0, 10), Validators.required]
  });

  ngOnInit() {
    this.loadFollowUps();
  }

  loadFollowUps() {
    this.isLoading.set(true);
    this.followUpService.getFollowUps().subscribe({
      next: (res) => {
        if (res.success) {
          this.followUps.set(res.data);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  // Quick Action for Jobs
  markJobInterview(jobId: string, companyName: string) {
    this.jobService.getJob(jobId).subscribe(res => {
      if (res.success) {
        const updated = { ...res.data, status: 'Interview Scheduled' as const };
        this.jobService.updateJob(jobId, updated).subscribe({
          next: () => {
            this.snackBar.open(`Status updated for ${companyName}!`, 'Close', { duration: 2000 });
            this.loadFollowUps();
          }
        });
      }
    });
  }

  // Quick Action for Outreach
  markOutreachReplied(outreachId: string, startupName: string) {
    this.outreachService.getOutreach(outreachId).subscribe(res => {
      if (res.success) {
        const updated = { ...res.data, responseStatus: 'Replied - Interested' as const };
        this.outreachService.updateOutreach(outreachId, updated).subscribe({
          next: () => {
            this.snackBar.open(`Marked ${startupName} outreach as replied!`, 'Close', { duration: 2000 });
            this.loadFollowUps();
          }
        });
      }
    });
  }

  // Quick Action for Connections
  markConnected(connectionId: string, personName: string) {
    this.networkingService.getConnection(connectionId).subscribe(res => {
      if (res.success) {
        const updated = { ...res.data, accepted: true };
        this.networkingService.updateConnection(connectionId, updated).subscribe({
          next: () => {
            this.snackBar.open(`Connected with ${personName}!`, 'Close', { duration: 2000 });
            this.loadFollowUps();
          }
        });
      }
    });
  }

  // Complete Custom Reminder
  completeCustom(id: string, completed: boolean) {
    this.followUpService.completeFollowUp(id, completed).subscribe({
      next: () => {
        this.snackBar.open(completed ? 'Follow-up marked as completed!' : 'Follow-up reopened!', 'Close', { duration: 2000 });
        this.loadFollowUps();
      }
    });
  }

  // Delete Custom Reminder
  deleteCustom(id: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Reminder',
        message: 'Are you sure you want to delete this reminder?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.followUpService.deleteFollowUp(id).subscribe({
          next: () => {
            this.snackBar.open('Reminder deleted!', 'Close', { duration: 2000 });
            this.loadFollowUps();
          }
        });
      }
    });
  }

  toggleAddCustom() {
    this.isAddingCustom.update(v => !v);
  }

  saveCustom() {
    if (this.customForm.invalid) return;
    
    const newFollowUp: FollowUp = {
      type: 'Custom',
      title: this.customForm.value.title,
      description: this.customForm.value.description,
      dueDate: this.customForm.value.dueDate,
      completed: false
    };

    this.followUpService.createFollowUp(newFollowUp).subscribe({
      next: () => {
        this.snackBar.open('Custom reminder created successfully!', 'Close', { duration: 3000 });
        this.customForm.reset({
          title: '',
          description: '',
          dueDate: new Date().toISOString().substring(0, 10)
        });
        this.isAddingCustom.set(false);
        this.loadFollowUps();
      },
      error: () => {
        this.isAddingCustom.set(false);
      }
    });
  }
}
