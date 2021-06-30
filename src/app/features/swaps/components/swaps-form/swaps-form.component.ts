import { Component, OnInit, ViewChild } from '@angular/core';
import { SwapsService } from 'src/app/features/swaps/services/swaps-service/swaps.service';
import { SWAP_PROVIDER_TYPE } from 'src/app/features/swaps/models/SwapProviderType';
import { AvailableTokenAmount } from 'src/app/shared/models/tokens/AvailableTokenAmount';
import { SwapFormService } from 'src/app/features/swaps/services/swaps-form-service/swap-form.service';
import { SupportedTokensInfo } from 'src/app/features/swaps/models/SupportedTokensInfo';
import { BlockchainsBridgeTokens } from 'src/app/features/bridge/models/BlockchainsBridgeTokens';
import { combineLatest } from 'rxjs';
import { TokenAmount } from 'src/app/shared/models/tokens/TokenAmount';
import BigNumber from 'bignumber.js';
import { blockchainsList } from 'src/app/features/swaps/constants/BlockchainsList';
import { BridgeBottomFormComponent } from 'src/app/features/bridge/components/bridge-bottom-form/bridge-bottom-form.component';
import { InstantTradeBottomFormComponent } from 'src/app/features/instant-trade/components/instant-trade-bottom-form/instant-trade-bottom-form.component';
import { SettingsService } from 'src/app/features/swaps/services/settings-service/settings.service';
import { SwapFormInput } from 'src/app/features/swaps/models/SwapForm';

type SelectedToken = {
  from: TokenAmount;
  to: TokenAmount;
};

@Component({
  selector: 'app-swaps-form',
  templateUrl: './swaps-form.component.html',
  styleUrls: ['./swaps-form.component.scss']
})
export class SwapsFormComponent implements OnInit {
  @ViewChild(BridgeBottomFormComponent) bridgeForm: BridgeBottomFormComponent;

  @ViewChild(InstantTradeBottomFormComponent) itForm: InstantTradeBottomFormComponent;

  public autoRefresh: boolean;

  public get isInstantTrade(): boolean {
    return this.swapsService.swapMode === SWAP_PROVIDER_TYPE.INSTANT_TRADE;
  }

  public get allowTrade(): boolean {
    const form = this.swapFormService.commonTrade.controls.input.value;
    return Boolean(
      form.fromAmount &&
        form.fromAmount.gt(0) &&
        form.fromBlockchain &&
        form.toBlockchain &&
        form.fromToken &&
        form.toToken
    );
  }

  private _supportedTokens: SupportedTokensInfo;

  private _bridgeTokensPairs: BlockchainsBridgeTokens[];

  public availableTokens: {
    from: AvailableTokenAmount[];
    to: AvailableTokenAmount[];
  } = {
    from: [],
    to: []
  };

  public selectedToken: SelectedToken = {} as SelectedToken;

  public selectedFromAmount = new BigNumber(0);

  public isLoading = true;

  public loadingStatus: 'refreshing' | 'stopped' | '';

  constructor(
    private readonly swapsService: SwapsService,
    public readonly swapFormService: SwapFormService,
    private readonly settingsService: SettingsService
  ) {}

  ngOnInit(): void {
    combineLatest([
      this.swapsService.availableTokens,
      this.swapsService.bridgeTokensPairs
    ]).subscribe(([supportedTokens, bridgeTokensPairs]) => {
      this.isLoading = true;

      if (!supportedTokens) {
        return;
      }

      this._supportedTokens = supportedTokens;
      this._bridgeTokensPairs = bridgeTokensPairs;

      this.setAvailableTokens('from');
      this.setAvailableTokens('to');

      this.updateSelectedToken('from');
      this.updateSelectedToken('to');

      this.isLoading = false;
    });

    this.autoRefresh = this.settingsService.settingsForm.controls.INSTANT_TRADE.value.autoRefresh;
    this.selectedFromAmount = this.swapFormService.commonTrade.controls.input.value.fromAmount;
    this.settingsService.settingsForm.controls.INSTANT_TRADE.get(
      'autoRefresh'
    ).valueChanges.subscribe(el => {
      this.autoRefresh = el;
    });

    this.setFormValues(this.swapFormService.commonTrade.controls.input.value);
    this.swapFormService.commonTrade.controls.input.valueChanges.subscribe(formValue => {
      this.isLoading = true;
      this.setFormValues(formValue);
      this.isLoading = false;
    });
  }

  private setFormValues(formValue: SwapFormInput): void {
    this.selectedFromAmount = formValue.fromAmount;

    if (this._supportedTokens) {
      this.setAvailableTokens('from');
      this.setAvailableTokens('to');

      setTimeout(() => {
        this.setNewSelectedToken('from', formValue.fromToken);
        this.setNewSelectedToken('to', formValue.toToken);
      });
    }
  }

  private setAvailableTokens(tokenType: 'from' | 'to'): void {
    const oppositeBlockchainName = tokenType === 'from' ? 'toBlockchain' : 'fromBlockchain';
    const oppositeBlockchain =
      this.swapFormService.commonTrade.controls.input.value[oppositeBlockchainName];

    const oppositeTokenName = tokenType === 'from' ? 'toToken' : 'fromToken';
    const oppositeToken = this.swapFormService.commonTrade.controls.input.value[oppositeTokenName];

    const tokens: AvailableTokenAmount[] = [];
    if (!oppositeToken) {
      Object.values(blockchainsList).forEach(blockchainItem => {
        const blockchain = blockchainItem.symbol;

        this._supportedTokens[blockchain][blockchain].forEach(token => {
          const foundToken = this._supportedTokens[oppositeBlockchain][blockchain].find(
            supportedToken => supportedToken.address.toLowerCase() === token.address.toLowerCase()
          );

          tokens.push({
            ...token,
            available: !!foundToken
          });
        });
      });
    } else {
      this._supportedTokens[oppositeBlockchain][oppositeBlockchain].forEach(token => {
        tokens.push({
          ...token,
          available:
            token.blockchain !== oppositeToken.blockchain ||
            token.address.toLowerCase() !== oppositeToken.address.toLowerCase()
        });
      });

      const tokensPairs = this._bridgeTokensPairs
        .filter(
          bridgeTokensPair =>
            bridgeTokensPair.fromBlockchain === oppositeBlockchain ||
            bridgeTokensPair.toBlockchain === oppositeBlockchain
        )
        .map(bridgeTokensPair =>
          bridgeTokensPair.bridgeTokens.find(
            bridgeToken =>
              bridgeToken.blockchainToken[oppositeBlockchain].address.toLowerCase() ===
              oppositeToken.address.toLowerCase()
          )
        )
        .filter(tokenPair => tokenPair);
      Object.values(blockchainsList).forEach(blockchainItem => {
        const blockchain = blockchainItem.symbol;
        if (oppositeBlockchain === blockchain) {
          return;
        }

        this._supportedTokens[blockchain][blockchain].forEach(token => {
          const foundTokenPair = tokensPairs.find(
            bridgeToken =>
              bridgeToken.blockchainToken[blockchain]?.address.toLowerCase() ===
              token.address.toLowerCase()
          );

          tokens.push({
            ...token,
            available: !!foundTokenPair
          });
        });
      });
    }

    this.availableTokens[tokenType] = tokens;
  }

  private updateSelectedToken(tokenType: 'from' | 'to'): void {
    if (!this.selectedToken[tokenType]) {
      return;
    }

    const token = this.selectedToken[tokenType];
    this.selectedToken[tokenType] = this._supportedTokens[token.blockchain][token.blockchain].find(
      supportedToken => supportedToken.address.toLowerCase() === token.address.toLowerCase()
    );

    const formKey = tokenType === 'from' ? 'fromToken' : 'toToken';
    this.swapFormService.commonTrade.controls.input.patchValue({
      [formKey]: this.selectedToken[tokenType]
    });
  }

  private setNewSelectedToken(tokenType: 'from' | 'to', token: TokenAmount): void {
    if (!token) {
      this.selectedToken[tokenType] = token;
      return;
    }

    this.selectedToken[tokenType] = this._supportedTokens[token.blockchain][token.blockchain].find(
      supportedToken => supportedToken.address.toLowerCase() === token.address.toLowerCase()
    );

    if (this.selectedToken[tokenType] !== token) {
      const formKey = tokenType === 'from' ? 'fromToken' : 'toToken';
      this.swapFormService.commonTrade.controls.input.patchValue({
        [formKey]: this.selectedToken[tokenType]
      });
    }
  }

  public getMinMaxAmounts(amountType: 'minAmount' | 'maxAmount'): number {
    return this.swapsService.getMinMaxAmounts(amountType);
  }

  public onTokenInputAmountChange(amount: string): void {
    if (!this.selectedFromAmount?.eq(amount)) {
      this.swapFormService.commonTrade.controls.input.patchValue({
        fromAmount: new BigNumber(amount)
      });
    }
  }

  public async revert() {
    const { fromBlockchain, toBlockchain, fromToken, toToken } =
      this.swapFormService.commonTrade.controls.input.value;
    const { toAmount } = this.swapFormService.commonTrade.controls.output.value;
    this.swapFormService.commonTrade.controls.input.patchValue({
      ...(fromToken && { toToken: fromToken }),
      ...(toToken && { fromToken: toToken }),
      ...(fromBlockchain && { toBlockchain: fromBlockchain }),
      ...(toBlockchain && { fromBlockchain: toBlockchain }),
      ...(toAmount && { fromAmount: toAmount })
    });
    await this.refreshTrade();
  }

  public async refreshTrade(): Promise<void> {
    this.loadingStatus = 'refreshing';
    await this.itForm?.calculateTrades();
    this.loadingStatus = 'stopped';
    setTimeout(() => (this.loadingStatus = ''), 1000);
  }
}
