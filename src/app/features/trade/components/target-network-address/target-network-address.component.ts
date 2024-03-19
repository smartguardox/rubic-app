import { ChangeDetectionStrategy, Component, OnInit, Self } from '@angular/core';
import { combineLatestWith, debounceTime, filter, skip, takeUntil } from 'rxjs/operators';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';
import { TargetNetworkAddressService } from '@features/trade/services/target-network-address-service/target-network-address.service';
import { getCorrectAddressValidator } from '@features/trade/components/target-network-address/utils/get-correct-address-validator';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-target-network-address',
  templateUrl: './target-network-address.component.html',
  styleUrls: ['./target-network-address.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService],
  animations: [
    trigger('moveLabel', [
      state('true', style({ color: '#02b774', fontSize: '12px', top: '-5px' })),
      state('false', style({ color: '#9a9ab0', fontSize: '16px', top: '0px' })),
      transition(`true <=> false`, animate('0.2s ease-out'))
    ])
  ]
})
export class TargetNetworkAddressComponent implements OnInit {
  public readonly address = this.targetNetworkAddressService.addressControl;

  public toBlockchain$ = this.swapFormService.toBlockchain$;

  public isActiveInput: boolean = false;

  constructor(
    private readonly targetNetworkAddressService: TargetNetworkAddressService,
    private readonly swapFormService: SwapsFormService,
    @Self() private readonly destroy$: TuiDestroyService
  ) {}

  public ngOnInit(): void {
    this.subscribeOnTargetAddress();
    this.subscribeOnFormValues();
    const input = this.swapFormService.inputValue;
    this.address.setAsyncValidators(
      getCorrectAddressValidator({
        fromAssetType: input.fromBlockchain,
        toBlockchain: input.toBlockchain
      })
    );
  }

  public onFocusChange(isFocused: boolean): void {
    this.isActiveInput = isFocused || !!this.address.value;
  }

  private subscribeOnFormValues(): void {
    this.swapFormService.inputValue$
      .pipe(skip(1), takeUntil(this.destroy$))
      .subscribe(inputForm => {
        this.address.setAsyncValidators(
          getCorrectAddressValidator({
            fromAssetType: inputForm.fromBlockchain,
            toBlockchain: inputForm.toBlockchain
          })
        );
        this.address.updateValueAndValidity();
      });
  }

  private subscribeOnTargetAddress(): void {
    this.address.valueChanges
      .pipe(
        combineLatestWith(this.targetNetworkAddressService.isAddressValid$),
        filter(([_, isValid]) => isValid),
        debounceTime(100),
        takeUntil(this.destroy$)
      )
      .subscribe(([address]) => {
        this.checkValidation(address);
      });
  }

  private checkValidation(address: string): void {
    this.targetNetworkAddressService.setAddress(address);
  }
}
