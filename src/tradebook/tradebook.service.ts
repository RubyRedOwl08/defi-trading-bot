import { Injectable, Logger } from '@nestjs/common'
import { TransactionReceiptData } from 'src/wardenswap/interfaces/wardenswap.interface'
import { TradebookEntityOptional, TradebookType } from './interfaces/tradebook.interface'
import BigNumber from 'bignumber.js'
import { TradebookRepository } from './tradebook.repository'
import { UtilsService } from 'src/utils/utils.service'
@Injectable()
export class TradebookService {
  private logger = new Logger('TradebookService')
  constructor(private utilsService: UtilsService, private tradebookRepository: TradebookRepository) {}

  createTradebook(transactionReceiptData: TransactionReceiptData, orderbookId) {
    const expectedTradeData: TradebookEntityOptional = {
      transactionHash: transactionReceiptData.transactionHash,
      executionDestAmountOutBase: transactionReceiptData.destAmountOutBase,
      executionPrice: new BigNumber(transactionReceiptData.destAmountOutBase)
        .div(transactionReceiptData.srcAmountInBase)
        .toString(10),
      transactionFeeBase: transactionReceiptData.transactionFee,
      // TODO: for test
      tradeType: TradebookType.STRATEGIES
    }
    this.logger.debug(`expectedTradeData ${expectedTradeData}`)
    return this.tradebookRepository.createTradebook(expectedTradeData, orderbookId)
  }
}
