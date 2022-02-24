import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@app/core/services/auth/auth.service';
import { WalletsModalService } from '@app/core/wallets/services/wallets-modal.service';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { combineLatest } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { LpProvidingService } from '../../services/lp-providing.service';

@Component({
  selector: 'app-lp-landing',
  templateUrl: './lp-landing.component.html',
  styleUrls: ['./lp-landing.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class LpLandingComponent implements OnInit {
  public readonly showDeposits$ = combineLatest([
    this.authService.getCurrentUser(),
    this.service.deposits$
  ]).pipe(
    map(([user, deposits]) => {
      return !(user?.address && Boolean(deposits?.length));
    })
  );

  public readonly depositsLoading$ = this.service.depositsLoading$;

  constructor(
    private readonly walletsModalService: WalletsModalService,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly service: LpProvidingService,
    private readonly destroy$: TuiDestroyService
  ) {}

  ngOnInit(): void {
    this.service
      .getDeposits()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.service.setDepositsLoading(false));
  }

  login(): void {
    this.walletsModalService.open().subscribe();
  }

  public navigateToDepositForm(): void {
    this.router.navigate(['liquidity-providing', 'deposit']);
  }
}
