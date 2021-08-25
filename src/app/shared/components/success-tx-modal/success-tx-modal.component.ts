import { Component, ChangeDetectionStrategy, Inject, OnInit } from '@angular/core';
import { TuiDialogContext } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { Subscription, timer } from 'rxjs';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { takeUntil } from 'rxjs/operators';

const lifetimeModal = 5000;

@Component({
  selector: 'app-success-tx-modal',
  templateUrl: './success-tx-modal.component.html',
  styleUrls: ['./success-tx-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class SuccessTxModalComponent implements OnInit {
  private timer: Subscription;

  public idPrefix: string;

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<boolean, { idPrefix: string }>,
    @Inject(TuiDestroyService) private readonly destroy$: TuiDestroyService
  ) {
    this.idPrefix = context.data.idPrefix;
  }

  public ngOnInit(): void {
    this.timer = timer(lifetimeModal)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.onConfirm());
  }

  public onConfirm(): void {
    this.context.completeWith(null);
  }
}
