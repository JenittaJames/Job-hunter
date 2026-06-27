import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FollowUp, FollowUpResponse } from '../models/followup.model';
import { API_BASE_URL } from './api.config';

@Injectable({
  providedIn: 'root'
})
export class FollowUpService {
  private http = inject(HttpClient);
  private apiUrl = `${API_BASE_URL}/followups`;

  getFollowUps(): Observable<FollowUpResponse> {
    return this.http.get<FollowUpResponse>(this.apiUrl);
  }

  createFollowUp(followUp: FollowUp): Observable<{ success: boolean; data: FollowUp }> {
    return this.http.post<{ success: boolean; data: FollowUp }>(this.apiUrl, followUp);
  }

  completeFollowUp(id: string, completed: boolean = true): Observable<{ success: boolean; data: FollowUp }> {
    return this.http.put<{ success: boolean; data: FollowUp }>(`${this.apiUrl}/${id}/complete`, { completed });
  }

  deleteFollowUp(id: string): Observable<{ success: boolean; data: any }> {
    return this.http.delete<{ success: boolean; data: any }>(`${this.apiUrl}/${id}`);
  }
}
