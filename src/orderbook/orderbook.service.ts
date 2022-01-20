import { Injectable, Logger, BadRequestException } from '@nestjs/common'
import { UtilsService } from 'src/utils/utils.service'
import { WardenswapService } from 'src/wardenswap/wardenswap.service'
import { CreateOrderbookDto } from './dto/CreateOrderbookDto'
import { OrderbookStatus, OrderbookType } from './interfaces/orderbook.interface'
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
    private utilsService: UtilsService,
    private wardenSwapService: WardenswapService,
    private orderbookRepository: OrderbookRepository,
    private ethersConnectService: EthersConnectService
  ) {}

  async createOrder(createOrderbookDto: CreateOrderbookDto): Promise<OrderbookEntity> {
    const srcTokenData = this.utilsService.getTokenData(createOrderbookDto.srcTokenAddress)
    const descTokenData = this.utilsService.getTokenData(createOrderbookDto.descTokenAddress)

    const srcAmountInWei = ethers.utils.parseUnits(createOrderbookDto.srcAmount, srcTokenData.decimals).toString()

    const srcTokenBalanceInWei = await this.ethersConnectService.getBalanceOfTokenWithAddrss(
      createOrderbookDto.srcTokenAddress
    )
    this.logger.debug(
      `Token ${srcTokenData.symbol} balance = ${ethers.utils.formatUnits(srcTokenBalanceInWei, srcTokenData.decimals)}`
    )
    // TODO: should support native token
    if (new BigNumber(srcAmountInWei).gt(srcTokenBalanceInWei)) {
      throw new BadRequestException(`Token ${srcTokenData.symbol} balance not enough`)
    }

    const bestRateResult = await this.wardenSwapService.getRate(
      srcTokenData.address,
      descTokenData.address,
      srcAmountInWei
    )
    // TODO: should check amaountout not 0 and deposite address not ''

    const amountOutInBase = ethers.utils.formatUnits(bestRateResult.amountOut.toString(), descTokenData.decimals)
    const activationPrice = new BigNumber(amountOutInBase).div(createOrderbookDto.srcAmount).toString(10)
    console.log('activationPrice ==>', activationPrice)
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
        descTokenAddress: descTokenData.address,
        descTokenSymbol: descTokenData.symbol,
        activationPrice: activationPrice,
        currentTask: currentTask,
        type: createOrderbookDto.orderType,
        status: OrderbookStatus.UNKNOWN,
        isOpen: true
      },
      createOrderbookDto
    )
    this.logger.debug('Test create', orderbookDataAddon)
    return this.orderbookRepository.createOrderbook(orderbookDataAddon)
  }

  async getOrderbooks(getOrderbooksFilterDto: GetOrderbooksFilterDto): Promise<OrderbookEntity[]> {
    return this.orderbookRepository.getOrderbooks(getOrderbooksFilterDto)
  }

  async getOrderbookById(id: string): Promise<OrderbookEntity> {
    return this.orderbookRepository.getOrderbookById(id)
  }
}
