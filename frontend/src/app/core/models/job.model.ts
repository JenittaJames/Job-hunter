export type JobStatus = 'Applied' | 'Interview Scheduled' | 'Technical Round' | 'HR Round' | 'Rejected' | 'Offer';

export interface JobApplication {
  _id?: string;
  user?: string;
  companyName: string;
  jobTitle: string;
  jobUrl?: string;
  location?: string;
  salary?: string;
  appliedDate: string | Date;
  applicationSource: string;
  status: JobStatus;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface JobResponse {
  success: boolean;
  count: number;
  total: number;
  pages: number;
  currentPage: number;
  data: JobApplication[];
}
