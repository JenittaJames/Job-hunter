import { DailyTargets } from './user.model';

export interface DashboardSummary {
  targets: DailyTargets;
  today: {
    applications: number;
    outreach: number;
    connections: number;
  };
  week: {
    applications: number;
    outreach: number;
    connections: number;
  };
  month: {
    applications: number;
    outreach: number;
    connections: number;
  };
  followUpsDue: {
    total: number;
    applications: number;
    outreach: number;
    networking: number;
    custom: number;
  };
}

export interface DashboardSummaryResponse {
  success: boolean;
  data: DashboardSummary;
}

export interface DailyTimelineItem {
  label: string;
  applications: number;
  outreach: number;
  connections: number;
}

export interface AnalyticsMetrics {
  totalApplications: number;
  totalOutreach: number;
  totalConnections: number;
  interviews: number;
  offers: number;
  interviewRate: number;
  responseRate: number;
  offerRate: number;
  networkingRate: number;
}

export interface AnalyticsData {
  metrics: AnalyticsMetrics;
  dailyTimeline: DailyTimelineItem[];
  statusBreakdown: {
    [status: string]: number;
  };
}

export interface AnalyticsResponse {
  success: boolean;
  data: AnalyticsData;
}
