export interface LinkedInConnection {
  _id?: string;
  user?: string;
  personName: string;
  designation?: string;
  company?: string;
  linkedinProfile: string;
  connectionRequestDate: string | Date;
  accepted: boolean;
  followUpSent: boolean;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface NetworkingResponse {
  success: boolean;
  count: number;
  total: number;
  pages: number;
  currentPage: number;
  data: LinkedInConnection[];
}
