import { Injectable, Logger } from '@nestjs/common'
import { UtilsService } from 'src/utils/utils.service'
import { WardenswapService } from 'src/wardenswap/wardenswap.service'
import { CreateOrderbookDto } from './dto/CreateOrderDto'
import { OrderbookStatus } from './interfaces/orderbook.interface'
import { OrderbookEntity } from './orderbook.entiry'
import { OrderbookRepository } from './orderbook.repository'
import { BigNumber } from 'nestjs-ethers'
import { ethers } from 'ethers'
@Injectable()
export class OrderbookService {
  private logger = new Logger('OrderbookService')
  constructor(
    private utilsService: UtilsService,
    private wardenSwapService: WardenswapService,
    private orderbookRepository: OrderbookRepository
  ) {}

  async createOrder(createOrderDto: CreateOrderbookDto): Promise<OrderbookEntity> {
    const srcTokenData = this.utilsService.getTokenData(createOrderDto.srcTokenAddress)
    const descTokenData = this.utilsService.getTokenData(createOrderDto.descTokenAddress)

    const srcAmountInWei = ethers.utils.parseUnits(createOrderDto.srcAmount, srcTokenData.decimals).toString()
    const orderbookDataAddon = Object.assign(
      {
        srcTokenAddress: srcTokenData.address,
        srcTokenSymbol: srcTokenData.symbol,
        descTokenAddress: descTokenData.address,
        descTokenSymbol: descTokenData.symbol
      },
      createOrderDto
    )
    this.logger.debug('Test create', orderbookDataAddon)
    const result = await this.wardenSwapService.getRate(srcTokenData.address, descTokenData.address, srcAmountInWei)
    // this.logger.debug(`Best rate `)

    // TODO: code here
    console.log('Best rate ==>', ethers.utils.formatUnits(result.amountOut.toString(), descTokenData.decimals))
    return this.orderbookRepository.createOrderbook(orderbookDataAddon)
  }
}
