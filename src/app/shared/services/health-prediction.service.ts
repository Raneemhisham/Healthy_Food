import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HealthPredictionService {
  private http = inject(HttpClient);

  // URLs for the Hugging Face APIs
  private hypertensionUrl = 'https://ashrafahmed-hypertention.hf.space/predict';
  private type1Url = 'https://ashrafahmed-blood-glucose-predictor-api.hf.space/predict/individual';
  private type2Url = 'https://ashrafahmed-type2.hf.space/predict';

  predictHypertension(data: any): Observable<any> {
    return this.http.post(this.hypertensionUrl, data);
  }

  predictType1(data: any): Observable<any> {
    return this.http.post(this.type1Url, data);
  }

  predictType2(data: any): Observable<any> {
    return this.http.post(this.type2Url, data);
  }
}