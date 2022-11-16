import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { BlockchainName } from 'rubic-sdk';
import { startWith } from 'rxjs/operators';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { SwapFormService } from '@features/swaps/core/services/swap-form-service/swap-form.service';
import { Observable } from 'rxjs';
import { TargetNetworkAddressService } from '@features/swaps/shared/components/target-network-address/services/target-network-address.service';
import { WINDOW } from '@ng-web-apis/common';

@Component({
  selector: 'app-target-network-address',
  templateUrl: './target-network-address.component.html',
  styleUrls: ['./target-network-address.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class TargetNetworkAddressComponent implements OnInit {
  public readonly address = this.targetNetworkAddressService.addressForm;

  public toBlockchain$: Observable<BlockchainName>;

  constructor(
    private readonly targetNetworkAddressService: TargetNetworkAddressService,
    private readonly swapFormService: SwapFormService,
    @Inject(WINDOW) private readonly window: Window
  ) {}

  public ngOnInit(): void {
    this.toBlockchain$ = this.swapFormService.input.controls.toBlockchain.valueChanges.pipe(
      startWith(this.swapFormService.inputValue.toBlockchain)
    );
  }

  public async setValueFromClipboard(): Promise<void> {
    const clipboardContent = await this.window.navigator.clipboard.readText();
    this.address.patchValue(clipboardContent);
  }
}
