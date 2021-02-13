import { Injectable } from '@angular/core';
import InstantTradeService from '../InstantTradeService';
import InstantTrade from '../types/InstantTrade';
import {InstantTradeToken} from '../types';
import {ChainId, Fetcher, Route, Token, TokenAmount, Trade, TradeType} from '@uniswap/sdk';
import BigNumber from 'bignumber.js';
import { Percent } from '@uniswap/sdk'
import {Web3ApiService} from '../../web3Api/web3-api.service';
import {UniSwapContractAbi, UniSwapContractAddress} from './uni-swap-contract';
import {ethers} from 'ethers';

@Injectable({
  providedIn: 'root'
})
export class UniSwapService extends InstantTradeService{

  static slippageTolerance = new Percent('50', '10000'); // 0.50%
  static provider = new ethers.providers.Web3Provider (window.ethereum);

  constructor(private web3Api: Web3ApiService) {
    super();
  }

  async getTrade(fromAmount: BigNumber, fromToken: InstantTradeToken, toToken: InstantTradeToken, chainId?): Promise<InstantTrade> {
    try {
      const uniSwapTrade = await this.getUniSwapTrade(fromAmount, fromToken, toToken, chainId);

      const amountIn = new BigNumber(uniSwapTrade.inputAmount.toSignificant(fromToken.decimals))
          .multipliedBy(10 ** fromToken.decimals)
          .toString();
      const amountOutMin = new BigNumber(uniSwapTrade.minimumAmountOut(UniSwapService.slippageTolerance).toSignificant(toToken.decimals))
          .multipliedBy(10 ** toToken.decimals)
          .toString();
      const path = [fromToken.address, toToken.address];
      const to = this.web3Api.address;
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20 // 20 minutes from the current Unix time

      /*const estimatedGas = await this.web3Api.getEstimatedGas(
          UniSwapContractAbi,
          UniSwapContractAddress,
          'swapExactTokensForTokensSupportingFeeOnTransferTokens',
          [amountIn, amountOutMin, path, to, deadline]
          );
  */
      const estimatedGas = new BigNumber(0);
      const gasFee = await this.web3Api.getGasFeeInUSD(estimatedGas);
      const amountOut = uniSwapTrade.minimumAmountOut(new Percent('0', '1')).toSignificant(toToken.decimals);

      const trade: InstantTrade = {
        from: {
          token: fromToken,
          amount: fromAmount
        },
        to: {
          token: toToken,
          amount: new BigNumber(amountOut)
        },
        estimatedGas,
        gasFee

      }
      return trade;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  getGasFee(fromAmount: BigNumber) {

  }

  async createTrade(trade: InstantTrade, onConfirm: Function): Promise<void> {
    return Promise.resolve(undefined);
  }

  getToAmount(fromAmount: BigNumber) {

  }

  private async provideAllowance(tokenAddress: string, value: BigNumber): Promise<void> {

  }

  private async getUniSwapTrade(fromAmount: BigNumber, fromToken: InstantTradeToken, toToken: InstantTradeToken, chainId?): Promise<Trade> {
    const uniSwapFromToken = new Token(chainId || ChainId.MAINNET, fromToken.address, fromToken.decimals);
    const uniSwapToToken = new Token(chainId || ChainId.MAINNET, toToken.address, toToken.decimals);
    const pair = await Fetcher.fetchPairData(uniSwapFromToken, uniSwapToToken, UniSwapService.provider);
    const route = new Route([pair], uniSwapFromToken);

    const fullFromAmount = fromAmount.multipliedBy(10 ** fromToken.decimals);

    return  new Trade(route, new TokenAmount(uniSwapFromToken, fullFromAmount.toString()), TradeType.EXACT_INPUT);
  }
}
