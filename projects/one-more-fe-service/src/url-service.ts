import { Injectable } from '@angular/core';
import { Location } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class UrlService {
  constructor(private location: Location) {}

  getCurrentUrl(): string {
    return window.location.origin + this.location.prepareExternalUrl(this.location.path());
  }
}
