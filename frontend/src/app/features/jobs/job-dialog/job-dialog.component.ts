import { Component, Inject, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { JobApplication } from '../../../core/models/job.model';

@Component({
  selector: 'app-job-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  templateUrl: './job-dialog.component.html',
  styleUrl: './job-dialog.component.scss'
})
export class JobDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<JobDialogComponent>);
  
  constructor(@Inject(MAT_DIALOG_DATA) public data: { job?: JobApplication }) {}

  jobForm: FormGroup = this.fb.group({
    companyName: ['', Validators.required],
    jobTitle: ['', Validators.required],
    jobUrl: [''],
    location: [''],
    salary: [''],
    appliedDate: [new Date().toISOString().substring(0, 10), Validators.required],
    applicationSource: ['LinkedIn', Validators.required],
    status: ['Applied', Validators.required],
    notes: ['']
  });

  isEditMode = false;

  ngOnInit() {
    if (this.data && this.data.job) {
      this.isEditMode = true;
      const job = this.data.job;
      
      // format date to yyyy-MM-dd
      let formattedDate = '';
      if (job.appliedDate) {
        formattedDate = new Date(job.appliedDate).toISOString().substring(0, 10);
      }

      this.jobForm.patchValue({
        companyName: job.companyName,
        jobTitle: job.jobTitle,
        jobUrl: job.jobUrl,
        location: job.location,
        salary: job.salary,
        appliedDate: formattedDate,
        applicationSource: job.applicationSource,
        status: job.status,
        notes: job.notes
      });
    }
  }

  onSubmit() {
    if (this.jobForm.invalid) return;
    this.dialogRef.close(this.jobForm.value);
  }

  onCancel() {
    this.dialogRef.close();
  }
}
