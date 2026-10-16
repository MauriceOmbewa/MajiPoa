import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface AddressDTO {
  county: string;
  subCounty: string;
  area: string;
  street: string;
  building: string;
  landmark: string;
  pinLocation: string;
}

export interface CustomerRequest {
  firstName: string;
  lastName: string;
  email: string;
  userName: string;
  phoneNumber: string;
  address: AddressDTO | null;
}

export interface CustomerResponse {
  customerId: string;
  email: string;
  firstName: string;
  lastName: string;
  userName: string;
  pictureUrl: string | null;
  role: string;
  phoneNumber: string;
  address: AddressDTO | null;
}

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/customer`;

  getMyProfile(): Observable<CustomerResponse> {
    return this.http.get<CustomerResponse>(
      `${this.apiUrl}/me`,
      { withCredentials: true }
    );
  }

  updateMyProfile(
    request: CustomerRequest
  ): Observable<CustomerResponse> {
    return this.http.put<CustomerResponse>(
      `${this.apiUrl}/me`,
      request,
      { withCredentials: true }
    );
  }

  deleteMyAddress(): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/me/address`,
      { withCredentials: true }
    );
  }
}