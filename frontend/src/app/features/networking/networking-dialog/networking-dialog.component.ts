import { Component, Inject, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { LinkedInConnection } from '../../../core/models/networking.model';

@Component({
  selector: 'app-networking-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule
  ],
  templateUrl: './networking-dialog.component.html',
  styleUrl: './networking-dialog.component.scss'
})
export class NetworkingDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<NetworkingDialogComponent>);

  constructor(@Inject(MAT_DIALOG_DATA) public data: { connection?: LinkedInConnection }) {}

  networkingForm: FormGroup = this.fb.group({
    personName: ['', Validators.required],
    designation: [''],
    company: [''],
    linkedinProfile: ['', Validators.required],
    connectionRequestDate: [new Date().toISOString().substring(0, 10), Validators.required],
    accepted: [false],
    followUpSent: [false],
    notes: ['']
  });

  isEditMode = false;

  ngOnInit() {
    if (this.data && this.data.connection) {
      this.isEditMode = true;
      const conn = this.data.connection;

      let reqDate = '';
      if (conn.connectionRequestDate) {
        reqDate = new Date(conn.connectionRequestDate).toISOString().substring(0, 10);
      }

      this.networkingForm.patchValue({
        personName: conn.personName,
        designation: conn.designation,
        company: conn.company,
        linkedinProfile: conn.linkedinProfile,
        connectionRequestDate: reqDate,
        accepted: conn.accepted,
        followUpSent: conn.followUpSent,
        notes: conn.notes
      });
    }
  }

  onSubmit() {
    if (this.networkingForm.invalid) return;
    this.dialogRef.close(this.networkingForm.value);
  }

  onCancel() {
    this.dialogRef.close();
  }
}
