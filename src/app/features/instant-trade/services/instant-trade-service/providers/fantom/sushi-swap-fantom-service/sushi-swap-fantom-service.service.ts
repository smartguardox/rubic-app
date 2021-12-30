import { Injectable } from '@angular/core';
import { SUSHI_SWAP_FANTOM_CONSTANTS } from 'src/app/features/instant-trade/services/instant-trade-service/providers/fantom/sushi-swap-fantom-service/sushi-swap-fantom.constants';
import { CommonUniswapV2Service } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/common-uniswap-v2.service';
import { INSTANT_TRADES_PROVIDERS } from '@shared/models/instant-trade/instant-trade-providers';

@Injectable({
  providedIn: 'root'
})
export class SushiSwapFantomService extends CommonUniswapV2Service {
  public readonly providerType = INSTANT_TRADES_PROVIDERS.SUSHISWAP;

  constructor() {
    super(SUSHI_SWAP_FANTOM_CONSTANTS);
  }
}
