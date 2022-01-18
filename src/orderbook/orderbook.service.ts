import { Injectable, Logger } from '@nestjs/common'
import { UtilsService } from 'src/utils/utils.service'
import { CreateOrderbookDto } from './dto/CreateOrderDto'
import { OrderbookStatus } from './interfaces/orderbook.interface'
import { OrderbookEntity } from './orderbook.entiry'
import { OrderbookRepository } from './orderbook.repository'

@Injectable()
export class OrderbookService {
  private logger = new Logger('OrderbookService')
  constructor(private utilsService: UtilsService, private orderbookRepository: OrderbookRepository) {}

  createOrder(createOrderDto: CreateOrderbookDto): Promise<OrderbookEntity> {
    const srcTokenData = this.utilsService.getTokenData(createOrderDto.srcTokenAddress)
    const descTokenData = this.utilsService.getTokenData(createOrderDto.descTokenAddress)

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
    return this.orderbookRepository.createOrderbook(orderbookDataAddon)
  }
}
