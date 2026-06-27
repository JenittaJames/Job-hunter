import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StartupOutreach, OutreachResponse } from '../models/outreach.model';
import { API_BASE_URL } from './api.config';

@Injectable({
  providedIn: 'root'
})
export class OutreachService {
  private http = inject(HttpClient);
  private apiUrl = `${API_BASE_URL}/outreach`;

  getOutreaches(
    search?: string,
    responseStatus?: string,
    page: number = 1,
    limit: number = 10
  ): Observable<OutreachResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search) params = params.set('search', search);
    if (responseStatus) params = params.set('responseStatus', responseStatus);

    return this.http.get<OutreachResponse>(this.apiUrl, { params });
  }

  getOutreach(id: string): Observable<{ success: boolean; data: StartupOutreach }> {
    return this.http.get<{ success: boolean; data: StartupOutreach }>(`${this.apiUrl}/${id}`);
  }

  createOutreach(outreach: StartupOutreach): Observable<{ success: boolean; data: StartupOutreach }> {
    return this.http.post<{ success: boolean; data: StartupOutreach }>(this.apiUrl, outreach);
  }

  updateOutreach(id: string, outreach: StartupOutreach): Observable<{ success: boolean; data: StartupOutreach }> {
    return this.http.put<{ success: boolean; data: StartupOutreach }>(`${this.apiUrl}/${id}`, outreach);
  }

  deleteOutreach(id: string): Observable<{ success: boolean; data: any }> {
    return this.http.delete<{ success: boolean; data: any }>(`${this.apiUrl}/${id}`);
  }
}
