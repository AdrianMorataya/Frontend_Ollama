import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface LoginRequest {
usernameOrEmail: string;
password: string;
success: boolean;
}

interface LoginResponse {
token: string;
}

interface RegisterRequest {
username: string;
email: string;
password: string;
role: string;
}

@Injectable({
providedIn: 'root'
})
export class AuthService {
private baseUrl = 'http://localhost:5024/api/Auth';

constructor(private http: HttpClient) {}

login(data: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, data);
}

register(data: RegisterRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, data);
}
}
