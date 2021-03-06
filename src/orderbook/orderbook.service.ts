import { Injectable, Logger, BadRequestException } from '@nestjs/common'
import { InjectConfig } from 'nestjs-config'
import { UtilsService } from 'src/utils/utils.service'
import { WardenswapService } from 'src/wardenswap/wardenswap.service'
import { CreateOrderbookDto } from './dto/CreateOrderbookDto'
import { OrderbookEntityOptional, OrderbookStatus, OrderbookType } from './interfaces/orderbook.interface'
import { OrderbookEntity } from './orderbook.entiry'
import { OrderbookRepository } from './orderbook.repository'
import { BigNumber } from 'bignumber.js'
import { ethers } from 'ethers'
import { GetOrderbooksFilterDto } from './dto/GetOrderBooksFilterDto'
import { BotManagerTask } from 'src/botManager/interfaces/bot-manager.interface'
import { EthersConnectService } from 'src/ethersConnect/ethers.service'
@Injectable()
export class OrderbookService {
  private logger = new Logger('OrderbookService')
  constructor(
    @InjectConfig() private readonly config,
    private utilsService: UtilsService,
    private wardenSwapService: WardenswapService,
    private orderbookRepository: OrderbookRepository,
    private ethersConnectService: EthersConnectService
  ) {}

  async createOrder(createOrderbookDto: CreateOrderbookDto): Promise<OrderbookEntity> {
    const srcTokenData = this.utilsService.getTokenData(createOrderbookDto.srcTokenAddress)
    const destTokenData = this.utilsService.getTokenData(createOrderbookDto.destTokenAddress)

    const srcAmountInWei = ethers.utils.parseUnits(createOrderbookDto.srcAmount, srcTokenData.decimals).toString()
    const srcTokenBalanceInWei = await this.ethersConnectService.getBalanceOfTokenWithAddrss(
      createOrderbookDto.srcTokenAddress
    )
    this.logger.log(
      `${srcTokenData.symbol} token balance = ${ethers.utils.formatUnits(srcTokenBalanceInWei, srcTokenData.decimals)}`
    )
    if (new BigNumber(srcAmountInWei).gt(srcTokenBalanceInWei)) {
      throw new BadRequestException(`${srcTokenData.symbol} token balance not enough`)
    }

    const bestRateResult = await this.wardenSwapService.getRate(
      srcTokenData.address,
      destTokenData.address,
      srcAmountInWei
    )

    const amountOutInBase = ethers.utils.formatUnits(bestRateResult.amountOut.toString(), destTokenData.decimals)
    this.utilsService.checkBestRateAmountOut(bestRateResult, srcTokenData.symbol, destTokenData.symbol)
    const activationPrice = new BigNumber(amountOutInBase).div(createOrderbookDto.srcAmount).toString(10)
    let currentTask: BotManagerTask

    switch (createOrderbookDto.orderType) {
      case OrderbookType.MARKET:
        currentTask = BotManagerTask.SWAP_TOKEN
        break
      case OrderbookType.STOP_LIMIT:
        currentTask = BotManagerTask.CHECK_PRICE
        break
      default:
        throw new Error(`Order type ${createOrderbookDto.orderType} not support.`)
    }

    const orderbookDataAddon = Object.assign(
      {
        srcTokenAddress: srcTokenData.address,
        srcTokenSymbol: srcTokenData.symbol,
        srcAmountInBase: createOrderbookDto.srcAmount,
        destTokenAddress: destTokenData.address,
        destTokenSymbol: destTokenData.symbol,
        activationPrice: activationPrice,
        currentTask: currentTask,
        type: createOrderbookDto.orderType,
        status: OrderbookStatus.UNKNOWN,
        isOpen: true
      },
      createOrderbookDto
    )
    return this.orderbookRepository.createOrderbook(orderbookDataAddon)
  }

  async getOrderbooks(getOrderbooksFilterDto: GetOrderbooksFilterDto): Promise<OrderbookEntity[]> {
    return this.orderbookRepository.getOrderbooks(getOrderbooksFilterDto)
  }

  async getOrderbookById(id: string): Promise<OrderbookEntity> {
    return this.orderbookRepository.getOrderbookById(id)
  }

  async cancleOrderbookById(orderbookId: string) {
    const data: OrderbookEntityOptional = { status: OrderbookStatus.CANCELED, isOpen: false }
    const OrderbookEntity = await this.orderbookRepository.updateOrderBookById(orderbookId, data)
    this.config.set(`botManager.tasks.${orderbookId}.isRunEvent`, false)

    return OrderbookEntity
  }
}
