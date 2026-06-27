import { Component, Inject, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { StartupOutreach } from '../../../core/models/outreach.model';

@Component({
  selector: 'app-outreach-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  templateUrl: './outreach-dialog.component.html',
  styleUrl: './outreach-dialog.component.scss'
})
export class OutreachDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<OutreachDialogComponent>);

  constructor(@Inject(MAT_DIALOG_DATA) public data: { outreach?: StartupOutreach }) {}

  outreachForm: FormGroup = this.fb.group({
    startupName: ['', Validators.required],
    website: [''],
    founderName: [''],
    contactEmail: ['', [Validators.required, Validators.email]],
    emailSentDate: [new Date().toISOString().substring(0, 10), Validators.required],
    followUpDate: [''],
    responseStatus: ['No Response', Validators.required],
    notes: ['']
  });

  isEditMode = false;

  ngOnInit() {
    if (this.data && this.data.outreach) {
      this.isEditMode = true;
      const outreach = this.data.outreach;

      let sentDate = '';
      if (outreach.emailSentDate) {
        sentDate = new Date(outreach.emailSentDate).toISOString().substring(0, 10);
      }

      let followDate = '';
      if (outreach.followUpDate) {
        followDate = new Date(outreach.followUpDate).toISOString().substring(0, 10);
      }

      this.outreachForm.patchValue({
        startupName: outreach.startupName,
        website: outreach.website,
        founderName: outreach.founderName,
        contactEmail: outreach.contactEmail,
        emailSentDate: sentDate,
        followUpDate: followDate,
        responseStatus: outreach.responseStatus,
        notes: outreach.notes
      });
    }
  }

  onSubmit() {
    if (this.outreachForm.invalid) return;
    this.dialogRef.close(this.outreachForm.value);
  }

  onCancel() {
    this.dialogRef.close();
  }
}
