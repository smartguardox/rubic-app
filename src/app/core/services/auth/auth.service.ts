import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { finalize, map, take } from 'rxjs/operators';
import { ProviderConnectorService } from '../blockchain/provider-connector/provider-connector.service';
import { Web3PrivateService } from '../blockchain/web3-private-service/web3-private.service';
import { HttpService } from '../http/http.service';
import { QueryParamsService } from '../query-params/query-params.service';
import { UserInterface } from './models/user.interface';
import { URLS } from './models/user.service.api';

interface BackendUser {
  isLogout?: boolean;
  balance: number;
  eos_balance: number;
  visibleBalance: string;
  contracts: number;
  eos_address: string;
  id: number;
  internal_address: string;
  internal_btc_address: string;
  is_social: boolean;
  lang: string;
  memo: string;
  use_totp: boolean;
  username: string;
  is_ghost?: boolean;
  is_swaps_admin?: any;
}

/**
 * Service that provides methods for working with authentication and user interaction.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  /**
   * Is auth process going in.
   */
  private isAuthProcess: boolean = false;

  /**
   * Current user data.
   */
  private readonly $currentUser: BehaviorSubject<UserInterface>;

  private readonly USER_IS_IN_SESSION_CODE = '1000';

  private authWithoutBackend: boolean;

  get user(): UserInterface {
    return this.$currentUser.getValue();
  }

  constructor(
    private readonly httpService: HttpService,
    private readonly web3Service: Web3PrivateService,
    private readonly providerConnector: ProviderConnectorService,
    private readonly queryParamsService: QueryParamsService
  ) {
    this.authWithoutBackend = false;
    this.$currentUser = new BehaviorSubject<UserInterface>(undefined);
    this.web3Service.address = undefined;
    this.providerConnector.$addressChange.subscribe(address => {
      if (this.isAuthProcess) {
        return;
      }
      // user inited, account not authorized on backend or authorized other account
      if (
        this.user !== undefined &&
        (this.user === null || this.user?.address !== address) &&
        address
      ) {
        /* this.$currentUser.next(null);
        this.signIn(); */
        this.queryParamsService.$isIframe.pipe(take(1)).subscribe(isIframe => {
          if (isIframe || this.authWithoutBackend) {
            this.$currentUser.next({ address });
          } else {
            // window.location.reload();
          }
        });
        // TODO: надо продумать модальные окна на кейсы, когда юзер сменил адрес в метамаске но не подписал nonce с бэка
      }
      if (this.authWithoutBackend) {
        this.web3Service.address = address;
        this.$currentUser.next({ address });
      }
    });
  }

  /**
   * @description Ger current user as observable.
   * @returns User.
   */
  public getCurrentUser(): Observable<UserInterface> {
    return this.$currentUser.asObservable();
  }

  /**
   * @description Fetch user data from backend.
   */
  private fetchUser(): Observable<UserInterface> {
    return this.httpService
      .get(URLS.PROFILE)
      .pipe(map((user: BackendUser) => ({ address: user.username })));
  }

  /**
   * @description Fetch metamask auth message for sign.
   */
  private fetchAuthNonce(): Promise<string> {
    return this.httpService.get('get_metamask_message/').toPromise();
  }

  /**
   * @description Authenticate user on backend.
   * @param address wallet address
   * @param nonce nonce to sign
   * @param signature signed nonce
   * @return Authentication key.
   */
  private sendSignedNonce(address: string, nonce: string, signature: string): Promise<void> {
    return this.httpService
      .post('metamask/', { address, message: nonce, signed_msg: signature }, URLS.HOSTS.AUTH_PATH)
      .toPromise();
  }

  public async loadUser() {
    this.isAuthProcess = true;
    this.fetchUser().subscribe(
      async user => {
        await this.providerConnector.activate();
        if (this.web3Service.address !== user.address) {
          this.signOut()
            .pipe(
              finalize(() => {
                this.signIn();
              })
            )
            .subscribe();
        } else {
          this.$currentUser.next(user);
        }
        this.isAuthProcess = false;
      },
      () => this.$currentUser.next(null)
    );
  }

  /**
   * @description Login user without backend.
   */
  public async loginWithoutBackend(): Promise<void> {
    this.authWithoutBackend = true;
    try {
      if (localStorage.getItem('provider')) {
        await this.providerConnector.activate();
        this.web3Service.address = this.providerConnector.address;
        this.$currentUser.next({ address: this.providerConnector.address });
        this.isAuthProcess = false;
      } else {
        this.$currentUser.next(null);
      }
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * @description Initiate authentication via metamask.
   */
  public async signIn(): Promise<void> {
    this.isAuthProcess = true;
    await this.providerConnector.activate();
    const nonce = await this.fetchAuthNonce();
    const signature = await this.web3Service.signPersonal(nonce);

    await this.sendSignedNonce(this.web3Service.address, nonce, signature);

    this.$currentUser.next({ address: this.web3Service.address });
    this.isAuthProcess = false;
  }

  /**
   * @description Logout request to backend.
   */
  public signOut(): Observable<void> {
    return this.httpService.get(URLS.LOGOUT, {}, URLS.HOSTS.AUTH_PATH).pipe(
      finalize(() => {
        this.$currentUser.next(null);
        this.providerConnector.deActivate();
      })
    );
  }
}
