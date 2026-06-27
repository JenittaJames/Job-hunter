import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JobApplication, JobResponse } from '../models/job.model';
import { API_BASE_URL } from './api.config';

@Injectable({
  providedIn: 'root'
})
export class JobService {
  private http = inject(HttpClient);
  private apiUrl = `${API_BASE_URL}/jobs`;

  getJobs(
    search?: string,
    status?: string,
    source?: string,
    page: number = 1,
    limit: number = 10
  ): Observable<JobResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search) params = params.set('search', search);
    if (status) params = params.set('status', status);
    if (source) params = params.set('source', source);

    return this.http.get<JobResponse>(this.apiUrl, { params });
  }

  getJob(id: string): Observable<{ success: boolean; data: JobApplication }> {
    return this.http.get<{ success: boolean; data: JobApplication }>(`${this.apiUrl}/${id}`);
  }

  createJob(job: JobApplication): Observable<{ success: boolean; data: JobApplication }> {
    return this.http.post<{ success: boolean; data: JobApplication }>(this.apiUrl, job);
  }

  updateJob(id: string, job: JobApplication): Observable<{ success: boolean; data: JobApplication }> {
    return this.http.put<{ success: boolean; data: JobApplication }>(`${this.apiUrl}/${id}`, job);
  }

  deleteJob(id: string): Observable<{ success: boolean; data: any }> {
    return this.http.delete<{ success: boolean; data: any }>(`${this.apiUrl}/${id}`);
  }
}
