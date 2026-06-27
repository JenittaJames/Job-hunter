import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LinkedInConnection, NetworkingResponse } from '../models/networking.model';
import { API_BASE_URL } from './api.config';

@Injectable({
  providedIn: 'root'
})
export class NetworkingService {
  private http = inject(HttpClient);
  private apiUrl = `${API_BASE_URL}/networking`;

  getConnections(
    search?: string,
    accepted?: string,
    followUpSent?: string,
    page: number = 1,
    limit: number = 10
  ): Observable<NetworkingResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search) params = params.set('search', search);
    if (accepted) params = params.set('accepted', accepted);
    if (followUpSent) params = params.set('followUpSent', followUpSent);

    return this.http.get<NetworkingResponse>(this.apiUrl, { params });
  }

  getConnection(id: string): Observable<{ success: boolean; data: LinkedInConnection }> {
    return this.http.get<{ success: boolean; data: LinkedInConnection }>(`${this.apiUrl}/${id}`);
  }

  createConnection(connection: LinkedInConnection): Observable<{ success: boolean; data: LinkedInConnection }> {
    return this.http.post<{ success: boolean; data: LinkedInConnection }>(this.apiUrl, connection);
  }

  updateConnection(id: string, connection: LinkedInConnection): Observable<{ success: boolean; data: LinkedInConnection }> {
    return this.http.put<{ success: boolean; data: LinkedInConnection }>(`${this.apiUrl}/${id}`, connection);
  }

  deleteConnection(id: string): Observable<{ success: boolean; data: any }> {
    return this.http.delete<{ success: boolean; data: any }>(`${this.apiUrl}/${id}`);
  }
}
