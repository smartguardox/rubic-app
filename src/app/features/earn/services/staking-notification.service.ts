import { Injectable } from '@angular/core';
import { NotificationsService } from '@app/core/services/notifications/notifications.service';
import { TuiNotification } from '@taiga-ui/core';

const SUCCESS_NOTIFICATION_OPTIONS = {
  status: TuiNotification.Success,
  autoClose: 5000
};

@Injectable()
export class StakingNotificationService {
  constructor(private readonly notificationsService: NotificationsService) {}

  public showSuccessDepositNotification(): void {
    this.notificationsService.show('BRBC have been deposited', SUCCESS_NOTIFICATION_OPTIONS);
  }

  public showSuccessClaimNotification(): void {
    this.notificationsService.show('Rewards have been claimed', SUCCESS_NOTIFICATION_OPTIONS);
  }

  public showSuccessWithdrawNotification(): void {
    this.notificationsService.show('Withdrawal has been succesful', SUCCESS_NOTIFICATION_OPTIONS);
  }

  public showSuccessApproveNotification(): void {
    this.notificationsService.show('Successful BRBC approve', SUCCESS_NOTIFICATION_OPTIONS);
  }

  public showNftLockedError(lockedUntil: string): void {
    this.notificationsService.show(`Nft is locked until ${lockedUntil}`, {
      autoClose: 5000,
      status: TuiNotification.Error
    });
  }
}
