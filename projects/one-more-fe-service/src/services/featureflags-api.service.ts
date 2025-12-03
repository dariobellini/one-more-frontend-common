import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Constants } from '../Constants';
import { FeatureFlagsResDto } from '../Dtos/Responses/feature-flags/FeatureFlagsResDto';

@Injectable({
  providedIn: 'root'
})
export class FeatureFlagsApiService {
  constructor(private http: HttpClient, private constants: Constants) {}

  /**
   * Recupera tutte le feature flags
   */
  Get(): Observable<FeatureFlagsResDto> {
    return this.http.get<FeatureFlagsResDto>(
      `${this.constants.BasePath()}/featureflag/feature-flags`
    );
  }
}
