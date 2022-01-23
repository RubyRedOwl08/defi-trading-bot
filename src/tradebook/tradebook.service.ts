import { Injectable, Logger } from '@nestjs/common'
import { MethodNameForTrade, TransactionSummary } from 'src/wardenswap/interfaces/wardenswap.interface'
import { TradebookEntityOptional, TradebookType } from './interfaces/tradebook.interface'
import BigNumber from 'bignumber.js'
import { TradebookRepository } from './tradebook.repository'
import { UtilsService } from 'src/utils/utils.service'
import { WardenswapService } from 'src/wardenswap/wardenswap.service'
import { NETWORK_CONSTANT } from '../constants'
@Injectable()
export class TradebookService {
  private logger = new Logger('TradebookService')
  constructor(
    private utilsService: UtilsService,
    private tradebookRepository: TradebookRepository,
    private wardenswapService: WardenswapService
  ) {}

  async createTradebook(transactionSummary: TransactionSummary, orderbookId) {
    const executionPrice = new BigNumber(transactionSummary.destAmountOutBase)
      .div(transactionSummary.srcAmountInBase)
      .toString(10)

    const destTokenPrice = await this.wardenswapService.getTokenPriceUsd(transactionSummary.destAssetAddress)
    const nativeTokenPrice = await this.wardenswapService.getTokenPriceUsd(NETWORK_CONSTANT[56].NATIVE_TOKEN.address)
    const executionDestAmountOutUsd = new BigNumber(destTokenPrice)
      .times(transactionSummary.destAmountOutBase)
      .toString(10)
    const transactionFeeUsd = new BigNumber(nativeTokenPrice).times(transactionSummary.transactionFee).toString(10)

    let tradeType: TradebookType
    if (transactionSummary.tradeMethodName === MethodNameForTrade.TRADE_STRATEGIES) {
      tradeType = TradebookType.STRATEGIES
    } else if (transactionSummary.tradeMethodName === MethodNameForTrade.TRADE_SPLIT) {
      tradeType = TradebookType.SPLIT
    } else {
      throw Error(`TradeMethodName ${transactionSummary.tradeMethodName} not support`)
    }
    const expectedTradeData: TradebookEntityOptional = {
      transactionHash: transactionSummary.transactionHash,
      executionDestAmountOutBase: transactionSummary.destAmountOutBase,
      executionDestAmountOutUsd,
      executionPrice,
      transactionFeeBase: transactionSummary.transactionFee,
      transactionFeeUsd,
      tradeType
    }
    const TradebookEntity = await this.tradebookRepository.createTradebook(expectedTradeData, orderbookId)
    this.logger.log(`Tradebook success`)
    return TradebookEntity
  }
}
