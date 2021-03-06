import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { ethers } from 'ethers'
import BigNumber from 'bignumber.js'
import { UtilsService } from 'src/utils/utils.service'
import { WardenswapService } from 'src/wardenswap/wardenswap.service'
import { InjectConfig } from 'nestjs-config'
import { BotManagerTaskService } from './bot-manager.task'
import { BotManagerTask } from './interfaces/bot-manager.interface'
import { OrderbookRepository } from 'src/orderbook/orderbook.repository'
import { OrderbookStatus } from 'src/orderbook/interfaces/orderbook.interface'
import { OrderbookEntity } from 'src/orderbook/orderbook.entiry'
import { EthersConnectService } from 'src/ethersConnect/ethers.service'
import { TradebookService } from 'src/tradebook/tradebook.service'
import { TransactionSummary } from 'src/wardenswap/interfaces/wardenswap.interface'

@Injectable()
export class BotManagerService {
  private logger = new Logger('BotManagerService')
  constructor(
    private utilsService: UtilsService,
    private wardenSwapServeice: WardenswapService,
    private botManagerTaskService: BotManagerTaskService,
    private orderbookRepository: OrderbookRepository,
    private ethersConnectService: EthersConnectService,
    private tradebookService: TradebookService,
    @InjectConfig() private readonly config
  ) {}

  async startBotManager() {
    const orderbookPendingList = await this.orderbookRepository.getOrderbooks({ isOpen: true })
    if (!orderbookPendingList.length) {
      return
    }
    orderbookPendingList.forEach(({ id }) => {
      this.startBotManagerByOrderbookId(id)
    })
  }

  async startBotManagerByOrderbookId(orderbookId: string, orderbookData?: OrderbookEntity) {
    if (!orderbookData) {
      orderbookData = await this.orderbookRepository.getOrderbookById(orderbookId)
    }
    if (!orderbookData.isOpen) {
      return
    }

    this.logger.log('Start orderbook id: ', orderbookId)
    switch (orderbookData.currentTask) {
      case BotManagerTask.CHECK_PRICE:
        await this.checkPriceByOrderId(orderbookId)
        this.startBotManagerByOrderbookId(orderbookId)
        break
      case BotManagerTask.SWAP_TOKEN: {
        const transactionReceiptData = await this.swapTokenByOrderbookId(orderbookId)
        await this.tradebookService.createTradebook(transactionReceiptData, orderbookId)
        break
      }
      default:
        this.logger.log(`Don't have management for task ${orderbookData.currentTask}`)
        return
    }
  }

  async checkPriceByOrderId(orderbookId: string, orderbookData?: OrderbookEntity) {
    this.botManagerTaskService.emitBotManagerTask(orderbookId, BotManagerTask.CHECK_PRICE)
    let isLoopInterval = true

    if (!orderbookData) {
      orderbookData = await this.orderbookRepository.getOrderbookById(orderbookId)
    }

    const srcTokenData = this.utilsService.getTokenData(orderbookData.srcTokenAddress)
    const destTokenData = this.utilsService.getTokenData(orderbookData.destTokenAddress)

    const srcAmountInWei = ethers.utils.parseUnits(orderbookData.srcAmountInBase, srcTokenData.decimals).toString()
    while (isLoopInterval) {
      try {
        const isTaskRunEvent = this.config.get(`botManager.tasks.${orderbookId}.isRunEvent`)
        if (!isTaskRunEvent) {
          this.config.set(`botManager.tasks.${orderbookId}.isRunEvent`, false)
          isLoopInterval = false
          break
        }

        const bestRateNow = await this.wardenSwapServeice.getRate(
          orderbookData.srcTokenAddress,
          orderbookData.destTokenAddress,
          srcAmountInWei
        )
        const bestRateAmountOutInWei = bestRateNow.amountOut.toString()
        const bestRateAmountOutInBase = ethers.utils.formatUnits(bestRateAmountOutInWei, destTokenData.decimals)

        this.utilsService.checkBestRateAmountOut(bestRateNow, srcTokenData.symbol, destTokenData.symbol)

        const priceNow = new BigNumber(bestRateAmountOutInBase).div(orderbookData.srcAmountInBase).toString(10)
        this.logger.log('---------------------------------------------------------')
        this.logger.log(`Order id: ${orderbookData.id}`)
        this.logger.log(`Trade pair: ${orderbookData.srcTokenSymbol}-${orderbookData.destTokenSymbol} |`)
        this.logger.log(`Activation price: ${orderbookData.activationPrice}`)
        this.logger.log(`Current price: ${priceNow}`)

        if (new BigNumber(orderbookData.stopPrice).gte(orderbookData.activationPrice)) {
          this.logger.log(`Condition stop price >= ${orderbookData.stopPrice}`)
          if (
            new BigNumber(priceNow).gte(orderbookData.activationPrice) &&
            new BigNumber(priceNow).gte(orderbookData.stopPrice)
          ) {
            this.logger.log(`Orderbook id: ${orderbookId} stop limit !!`)
            await this.orderbookRepository.updateOrderBookById(orderbookId, { currentTask: BotManagerTask.SWAP_TOKEN })
            isLoopInterval = false
          }
        } else {
          this.logger.log(`Condition stop price <= ${orderbookData.stopPrice}`)
          if (
            new BigNumber(priceNow).lte(orderbookData.activationPrice) &&
            new BigNumber(priceNow).lte(orderbookData.stopPrice)
          ) {
            this.logger.log(`Orderbook id: ${orderbookId} stop limit !!`)
            await this.orderbookRepository.updateOrderBookById(orderbookId, { currentTask: BotManagerTask.SWAP_TOKEN })
            isLoopInterval = false
          }
        }
        this.logger.log('---------------------------------------------------------')

        // ? Wait 10s before next round
        await this.utilsService.delay(1000 * 10)
      } catch (error) {
        this.logger.log(`checkPriceByOrderId Error ${error.message}`)
        isLoopInterval = false
        this.logger.log('Delay 15s')
        this.utilsService.delay(1000 * 15)
        break
      }
    }
  }

  async swapTokenByOrderbookId(orderbookId: string, orderbookData?: OrderbookEntity): Promise<TransactionSummary> {
    this.logger.log('Start process swap token')
    if (!orderbookData) {
      orderbookData = await this.orderbookRepository.getOrderbookById(orderbookId)
    }
    const srcTokenData = this.utilsService.getTokenData(orderbookData.srcTokenAddress)
    const srcAmountInWei = ethers.utils.parseUnits(orderbookData.srcAmountInBase, srcTokenData.decimals).toString()

    await this.orderbookRepository.updateOrderBookById(orderbookId, { status: OrderbookStatus.PENDING })

    try {
      const srcTokenBalanceInWei = await this.ethersConnectService.getBalanceOfTokenWithAddrss(
        orderbookData.srcTokenAddress
      )
      this.logger.log(
        `${srcTokenData.symbol} token balance = ${ethers.utils.formatUnits(
          srcTokenBalanceInWei,
          srcTokenData.decimals
        )}`
      )

      if (new BigNumber(srcAmountInWei).gt(srcTokenBalanceInWei)) {
        throw new Error(`Insufficient of ${srcTokenData.symbol} token in the wallet`)
      }

      const transactionReceiptData = await this.wardenSwapServeice.tradeToken(
        orderbookData.srcTokenAddress,
        orderbookData.destTokenAddress,
        srcAmountInWei
      )

      await this.orderbookRepository.updateOrderBookById(orderbookId, {
        isOpen: false,
        status: OrderbookStatus.SUCCESS
      })

      this.logger.log('Transaction receipt data', JSON.stringify(transactionReceiptData, null, 4))
      return transactionReceiptData
    } catch (error) {
      this.logger.error(error.message)
      await this.orderbookRepository.updateOrderBookById(orderbookId, {
        isOpen: false,
        status: OrderbookStatus.FAILED
      })

      throw error
    }
  }
}
