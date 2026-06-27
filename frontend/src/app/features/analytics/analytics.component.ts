import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DashboardService } from '../../core/services/dashboard.service';
import { AnalyticsData, DailyTimelineItem } from '../../core/models/dashboard.model';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.scss'
})
export class AnalyticsComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private snackBar = inject(MatSnackBar);

  analytics = signal<AnalyticsData | null>(null);
  isLoading = signal(true);

  // SVG Chart Calculations using computed signals
  chartWidth = 800;
  chartHeight = 250;
  padding = 30;

  // Maximum value in daily timeline for scaling
  maxChartValue = computed(() => {
    const data = this.analytics();
    if (!data || data.dailyTimeline.length === 0) return 10;
    
    let max = 5; // default minimum ceiling
    data.dailyTimeline.forEach((item: DailyTimelineItem) => {
      if (item.applications > max) max = item.applications;
      if (item.outreach > max) max = item.outreach;
      if (item.connections > max) max = item.connections;
    });
    return Math.ceil(max / 5) * 5; // round to nearest 5
  });

  // SVG coordinate grids
  yGridLines = computed(() => {
    const max = this.maxChartValue();
    const lines = [];
    const steps = 4;
    for (let i = 0; i <= steps; i++) {
      const val = (max / steps) * i;
      const y = this.chartHeight - this.padding - ((val / max) * (this.chartHeight - 2 * this.padding));
      lines.push({ value: Math.round(val), y });
    }
    return lines;
  });

  // Calculate points for SVG Paths
  svgPoints = computed(() => {
    const data = this.analytics();
    const max = this.maxChartValue();
    if (!data) return { apps: '', outreach: '', connections: '', xGrid: [] as number[] };

    const items = data.dailyTimeline;
    const count = items.length;
    const graphWidth = this.chartWidth - 2 * this.padding;
    const graphHeight = this.chartHeight - 2 * this.padding;

    let appsPath = '';
    let outreachPath = '';
    let connectionsPath = '';
    const xGrid: number[] = [];

    items.forEach((item: DailyTimelineItem, index: number) => {
      const x = this.padding + (index / (count - 1)) * graphWidth;
      xGrid.push(x);

      // App Y
      const yApps = this.chartHeight - this.padding - (item.applications / max) * graphHeight;
      appsPath += (index === 0 ? 'M' : 'L') + `${x},${yApps} `;

      // Outreach Y
      const yOut = this.chartHeight - this.padding - (item.outreach / max) * graphHeight;
      outreachPath += (index === 0 ? 'M' : 'L') + `${x},${yOut} `;

      // Connections Y
      const yConn = this.chartHeight - this.padding - (item.connections / max) * graphHeight;
      connectionsPath += (index === 0 ? 'M' : 'L') + `${x},${yConn} `;
    });

    return {
      apps: appsPath.trim(),
      outreach: outreachPath.trim(),
      connections: connectionsPath.trim(),
      xGrid
    };
  });

  ngOnInit() {
    this.loadAnalytics();
  }

  loadAnalytics() {
    this.isLoading.set(true);
    this.dashboardService.getAnalytics().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.analytics.set(res.data);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.snackBar.open('Failed to load analytics charts', 'Close', { duration: 3000 });
      }
    });
  }

  // Get status array keys for looping breakdown
  getStatusKeys(breakdown: { [key: string]: number }): { name: string, value: number }[] {
    return Object.keys(breakdown).map(key => ({ name: key, value: breakdown[key] }));
  }

  // Get percentage of status inside breakdown
  getStatusPercent(val: number): number {
    const data = this.analytics();
    if (!data || data.metrics.totalApplications === 0) return 0;
    return Math.round((val / data.metrics.totalApplications) * 100);
  }
}
