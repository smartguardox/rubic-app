import { firstValueFrom } from 'rxjs';
import { CrossChainCalculatedTrade } from '@features/swaps/features/cross-chain/models/cross-chain-calculated-trade';
import { BlockchainsInfo, ChangenowCrossChainTrade, CROSS_CHAIN_TRADE_TYPE } from 'rubic-sdk';
import {
  FetchedTonPromoInfo,
  ShortTonPromoInfo,
  TonPromoInfo,
  TonPromoUserInfo
} from '@features/swaps/features/cross-chain/services/ton-promo-service/models/ton-promo';
import { HttpService } from '@core/services/http/http.service';
import { getSignature } from '@shared/utils/get-signature';
import { Injectable } from '@angular/core';

@Injectable()
export class TonPromoService {
  private readonly emptyTonPromoInfo: ShortTonPromoInfo = {
    isTonPromoTrade: false,
    totalUserConfirmedTrades: 0
  };

  constructor(private readonly httpService: HttpService) {}

  private async fetchTonPromoInfo(userWalletAddress: string): Promise<TonPromoInfo> {
    const [fetchedTonPromoInfo, fetchedTonPromoUserInfo] = await Promise.all([
      this.httpService.get<FetchedTonPromoInfo>('promo_campaigns/ton_crosschain_promo'),
      this.httpService.get<TonPromoUserInfo>(
        `promo_validations/user_validations?address=${userWalletAddress}`
      )
    ]);

    const tonPromoInfo = await firstValueFrom(fetchedTonPromoInfo);
    const tonPromoUserInfo = await firstValueFrom(fetchedTonPromoUserInfo);

    return {
      is_active: tonPromoInfo.is_active,
      confirmed_rewards_amount: tonPromoInfo.confirmed_rewards_amount,
      confirmed_trades: tonPromoUserInfo.confirmed_trades
    };
  }

  public async getTonPromoInfo(
    calculatedTrade: CrossChainCalculatedTrade,
    userWalletAddress: string
  ): Promise<ShortTonPromoInfo> {
    const totalInputAmountInUSD = calculatedTrade.trade.from.price.multipliedBy(
      calculatedTrade.trade.from.tokenAmount
    );

    if (
      !BlockchainsInfo.isEvmBlockchainName(calculatedTrade.trade.from.blockchain) ||
      !(calculatedTrade.tradeType === CROSS_CHAIN_TRADE_TYPE.CHANGENOW) ||
      totalInputAmountInUSD.lt(20)
    ) {
      console.log(
        'Not evm network: ',
        !BlockchainsInfo.isEvmBlockchainName(calculatedTrade.trade.from.blockchain)
      );
      console.log(
        'Not ChangeNow provider: ',
        !(calculatedTrade.tradeType === CROSS_CHAIN_TRADE_TYPE.CHANGENOW)
      );
      console.log('Amount less then 20$: ', totalInputAmountInUSD.lt(20));
      return this.emptyTonPromoInfo;
    }

    try {
      const { is_active, confirmed_rewards_amount, confirmed_trades } =
        await this.fetchTonPromoInfo(userWalletAddress);

      if (!is_active || !confirmed_rewards_amount || confirmed_trades === 3) {
        console.log('Promo not active: ', is_active);
        console.log('Confirmed amount great then 300: ', confirmed_rewards_amount > 300);
        console.log('Confirmed user trades great then 3: ', confirmed_trades >= 3);
        return this.emptyTonPromoInfo;
      }

      return {
        isTonPromoTrade: confirmed_rewards_amount < 300 && is_active,
        totalUserConfirmedTrades: confirmed_trades
      };
    } catch (error) {
      console.log('Fetch error: ', error);
      return this.emptyTonPromoInfo;
    }
  }

  public async postTonPromoTradeInfo(
    trade: ChangenowCrossChainTrade,
    fromAddress: string,
    transactionHash: string
  ): Promise<void> {
    await firstValueFrom(
      this.httpService.post(
        `promo_validations/create_validation`,
        {
          address: fromAddress,
          tx_hash: transactionHash,
          change_now_tx_id: (trade as ChangenowCrossChainTrade).id
        },
        '',
        {
          headers: {
            Signature: getSignature(fromAddress, transactionHash)
          }
        }
      )
    );
  }

  public getTonPromoPointsAmount(totalUserConfirmedTrades: number): number {
    if (totalUserConfirmedTrades === 0) {
      return 200;
    }

    if (totalUserConfirmedTrades === 1 || totalUserConfirmedTrades === 2) {
      return 100;
    }

    return 0;
  }
}
