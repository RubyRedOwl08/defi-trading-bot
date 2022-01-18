import { EntityRepository, Repository } from 'typeorm'
import { OrderbookStatus } from './interfaces/orderbook.interface'
import { OrderbookEntity } from './orderbook.entiry'

@EntityRepository(OrderbookEntity)
export class OrderbookRepository extends Repository<OrderbookEntity> {
  async createOrderbook(createOrderData: any): Promise<OrderbookEntity> {
    const order = this.create(
      Object.assign(
        {
          srcTokenAddress: createOrderData.srcTokenAddress,
          srcTokenSymbol: createOrderData.srcTokenSymbol,
          descTokenAddress: createOrderData.descTokenAddress,
          descTokenSymbol: createOrderData.descTokenSymbol,
          tragetPrice: createOrderData.tragetPrice,
          type: createOrderData.orderType,
          status: OrderbookStatus.UNKNOWN,
          activationPrice: '0.1'
        },
        createOrderData.hasOwnProperty('description') ? { description: createOrderData.description } : null
      )
    )

    await this.save(order)
    return order
  }
}
