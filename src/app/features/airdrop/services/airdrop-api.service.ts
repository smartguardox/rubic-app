import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  AirdropUserClaimInfo,
  AirdropUserPointsInfo
} from '@features/airdrop/models/airdrop-user-info';
import { HttpService } from '@core/services/http/http.service';
import { defaultUserClaimInfo } from '@shared/services/token-distribution-services/constants/default-user-claim-info';

@Injectable()
export class AirdropApiService {
  constructor(private readonly httpService: HttpService) {}

  public fetchAirdropUserPointsInfo(address: string | null): Observable<AirdropUserPointsInfo> {
    if (!address) {
      return of({ confirmed: 0, pending: 0 });
    }
    return this.httpService.get<AirdropUserPointsInfo>(`rewards/?address=${address}`);
  }

  public fetchAirdropUserClaimInfo(address: string | null): Observable<AirdropUserClaimInfo> {
    if (!address) {
      return of(defaultUserClaimInfo);
    }
    try {
      return this.httpService.get<AirdropUserClaimInfo>(`v2/merkle_proofs/claim`, {
        address: address
      });
    } catch (error) {
      return of(defaultUserClaimInfo);
    }
  }
}
