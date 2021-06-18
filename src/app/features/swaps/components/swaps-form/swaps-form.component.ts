import { Component } from '@angular/core';
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

type SelectedToken = {
  from: TokenAmount;
  to: TokenAmount;
};

@Component({
  selector: 'app-swaps-form',
  templateUrl: './swaps-form.component.html',
  styleUrls: ['./swaps-form.component.scss']
})
export class SwapsFormComponent {
  public get isInstantTrade(): boolean {
    return this.swapsService.swapMode === SWAP_PROVIDER_TYPE.INSTANT_TRADE;
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

  constructor(
    private readonly swapsService: SwapsService,
    private readonly swapFormService: SwapFormService
  ) {
    combineLatest([
      this.swapsService.availableTokens,
      this.swapsService.bridgeTokensPairs
    ]).subscribe(([supportedTokens, bridgeTokensPairs]) => {
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

    this.selectedFromAmount = this.swapFormService.commonTrade.controls.input.value.fromAmount;
    this.swapFormService.commonTrade.controls.input.valueChanges.subscribe(formValue => {
      this.isLoading = true;

      this.selectedFromAmount = formValue.fromAmount;

      if (this._supportedTokens) {
        this.setAvailableTokens('from');
        this.setAvailableTokens('to');
      }

      this.setNewSelectedToken('from', formValue['fromToken']);
      this.setNewSelectedToken('to', formValue['toToken']);

      this.isLoading = false;
    });
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
      [formKey]: token
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
      this.swapFormService.commonTrade.controls.input.patchValue(
        {
          [formKey]: token
        },
        {
          emitEvent: false
        }
      );
    }
  }

  public getMinMaxAmounts(amountType: 'minAmount' | 'maxAmount'): number {
    return this.swapsService.getMinMaxAmounts(amountType);
  }

  public onTokenInputAmountChange(amount: string): void {
    this.swapFormService.commonTrade.controls.input.patchValue({
      fromAmount: new BigNumber(amount)
    });
  }
}
