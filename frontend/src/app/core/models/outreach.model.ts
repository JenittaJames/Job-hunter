export type ResponseStatus = 'No Response' | 'Replied - Interested' | 'Replied - Not Interested';

export interface StartupOutreach {
  _id?: string;
  user?: string;
  startupName: string;
  website?: string;
  founderName?: string;
  contactEmail: string;
  emailSentDate: string | Date;
  followUpDate?: string | Date;
  responseStatus: ResponseStatus;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OutreachResponse {
  success: boolean;
  count: number;
  total: number;
  pages: number;
  currentPage: number;
  data: StartupOutreach[];
}
