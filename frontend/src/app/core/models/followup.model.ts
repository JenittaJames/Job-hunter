export type FollowUpType = 'Application' | 'Outreach' | 'Networking' | 'Custom';

export interface FollowUp {
  _id?: string;
  user?: string;
  type: FollowUpType;
  referenceId?: string;
  title: string;
  description?: string;
  dueDate: string | Date;
  completed: boolean;
  completedAt?: string | Date;
  createdAt?: string;
  updatedAt?: string;
}

export interface FollowUpItem {
  id: string;
  type: FollowUpType;
  title: string;
  date: string;
  daysAgo: number;
  source: any; // original item object
}

export interface FollowUpResponseData {
  jobs: FollowUpItem[];
  outreach: FollowUpItem[];
  networking: FollowUpItem[];
  custom: FollowUp[];
}

export interface FollowUpResponse {
  success: boolean;
  data: FollowUpResponseData;
}
