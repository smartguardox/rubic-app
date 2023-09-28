import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  combineLatestWith,
  firstValueFrom,
  from,
  map,
  Observable,
  of
} from 'rxjs';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { switchIif, switchTap } from '@shared/utils/utils';
import { HttpService } from '@core/services/http/http.service';
import {
  AirdropUserClaimInfo,
  AirdropUserPointsInfo
} from '@features/airdrop/models/airdrop-user-info';
import { SuccessWithdrawModalComponent } from '@shared/components/success-modal/success-withdraw-modal/success-withdraw-modal.component';
import { ModalService } from '@core/modals/services/modal.service';
import { AirdropApiService } from '@features/airdrop/services/airdrop-api.service';
import { airdropContractAddress } from '@features/airdrop/constants/airdrop-contract-address';
import { ClaimWeb3Service } from '@shared/services/token-distribution-services/claim-web3.service';
import { defaultUserClaimInfo } from '@shared/services/token-distribution-services/constants/default-user-claim-info';
import { AuthService } from '@core/services/auth/auth.service';
import { BlockchainName, Web3Pure } from 'rubic-sdk';
import { BigNumber as EthersBigNumber } from '@ethersproject/bignumber/lib/bignumber';
import { ClaimRound } from '@shared/models/claim/claim-round';
import { airdropRounds } from '@features/airdrop/constants/airdrop-rounds';
import { catchError, tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AirdropService {
  private readonly defaultPoints: AirdropUserPointsInfo = {
    confirmed: 0,
    pending: 0
  };

  private readonly _fetchUserInfoLoading$ = new BehaviorSubject(false);

  public readonly fetchUserInfoLoading$ = this._fetchUserInfoLoading$.asObservable();

  private readonly _fetchUserPointsInfoLoading$ = new BehaviorSubject(false);

  public readonly fetchUserPointsInfoLoading$ = this._fetchUserPointsInfoLoading$.asObservable();

  private readonly _points$ = new BehaviorSubject<AirdropUserPointsInfo>(this.defaultPoints);

  public readonly points$ = this._points$.asObservable();

  private readonly _rounds$ = new BehaviorSubject<ClaimRound[]>([]);

  public readonly rounds$ = this._rounds$.asObservable();

  private readonly _airdropUserInfo$ = new BehaviorSubject<AirdropUserClaimInfo>(
    defaultUserClaimInfo
  );

  public readonly airdropUserInfo$ = this._airdropUserInfo$.asObservable();

  constructor(
    private readonly walletConnectorService: WalletConnectorService,
    private readonly httpService: HttpService,
    private readonly dialogService: ModalService,
    private readonly apiService: AirdropApiService,
    private readonly web3Service: ClaimWeb3Service,
    private readonly authService: AuthService
  ) {
    this.handleAddressChange();
    this.subscribeOnWalletChange();
  }

  private subscribeOnWalletChange(): void {
    this.authService.currentUser$
      .pipe(
        combineLatestWith(this.walletConnectorService.networkChange$),
        tap(([user, network]) => {
          if (!user || !user.address) {
            return null;
          }

          this.setUserInfo(network);
        })
      )
      .subscribe();
  }

  private setUserInfo(network: BlockchainName): void {
    this._fetchUserInfoLoading$.next(true);

    this.apiService
      .fetchAirdropUserClaimInfo()
      .pipe(
        switchTap(airdropUserInfo => {
          this._airdropUserInfo$.next(airdropUserInfo);

          return from(this.setRounds(airdropUserInfo, network));
        }),
        catchError(() => of())
      )
      .subscribe(() => this._fetchUserInfoLoading$.next(false));
  }

  private async setRounds(
    airdropUserInfo: AirdropUserClaimInfo,
    network: BlockchainName
  ): Promise<void> {
    const promisesRounds = airdropRounds.map(round => {
      if (airdropUserInfo.round === round.roundNumber) {
        return this.web3Service
          .checkClaimed(airdropContractAddress, airdropUserInfo.index)
          .then(isAlreadyClaimed => ({
            ...round,
            network,
            isAlreadyClaimed,
            isParticipantOfCurrentRound: airdropUserInfo.is_participant,
            claimAmount: Web3Pure.fromWei(airdropUserInfo.amount),
            claimData: {
              contractAddress: airdropContractAddress,
              node: {
                index: airdropUserInfo.index,
                account: airdropUserInfo.address,
                amount: EthersBigNumber.from(airdropUserInfo.amount)
              },
              proof: airdropUserInfo.proof
            }
          }));
      } else {
        return {
          ...round,
          ...airdropUserInfo,
          network,
          claimData: {
            ...round.claimData,
            node: {
              ...round.claimData.node,
              account: airdropUserInfo.address
            }
          }
        };
      }
    });

    const formattedRounds = await Promise.all(promisesRounds);
    this._rounds$.next(formattedRounds.reverse());
  }

  public updateRound(roundNumber: number): void {
    this.rounds$
      .pipe(
        map(rounds => {
          return rounds.map(round => {
            if (round.roundNumber === roundNumber) {
              return {
                ...round,
                isAlreadyClaimed: true
              };
            } else {
              return round;
            }
          });
        }),
        tap(updatedRounds => this._rounds$.next(updatedRounds))
      )
      .subscribe();
  }

  public updateSwapToEarnUserPointsInfo(): void {
    this._fetchUserPointsInfoLoading$.next(true);
    this.apiService.fetchAirdropUserPointsInfo().subscribe(points => {
      this._points$.next(points);
      this._fetchUserPointsInfoLoading$.next(false);
    });
  }

  public getSwapAndEarnPointsAmount(): Observable<number> {
    return this.points$.pipe(
      map(points => {
        if (points.participant) {
          return 50;
        }

        return 100;
      })
    );
  }

  public async claimPoints(points: number): Promise<void> {
    const address = this.walletConnectorService.address;

    if (address) {
      await firstValueFrom(this.httpService.post(`rewards/withdraw/?address=${address}`));

      this.dialogService
        .showDialog(SuccessWithdrawModalComponent, {
          data: {
            points: points
          }
        })
        .subscribe();

      this.updateSwapToEarnUserPointsInfo();
    }
  }

  private handleAddressChange(): void {
    this.walletConnectorService.addressChange$
      .pipe(
        switchIif(
          Boolean,
          () => this.apiService.fetchAirdropUserPointsInfo(),
          () => of(this.defaultPoints)
        )
      )
      .subscribe(points => {
        this._points$.next(points);
      });
  }
}
