import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private token: string = '';
  public tokenChanged: EventEmitter<string> = new EventEmitter();

  setToken(token: string): void {
    this.token = token;
    this.tokenChanged.emit(token);
  }

  clearToken(): void {
    this.token = '';
    this.tokenChanged.emit('');
  }

  getToken(): string {
    return this.token;
  }
}
