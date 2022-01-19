import { EntityRepository, Repository } from 'typeorm'
import { OrderbookEntityOptional } from './interfaces/orderbook.interface'
import { OrderbookEntity } from './orderbook.entiry'
import { GetOrderbooksFilterDto } from './dto/GetOrderBooksFilterDto'
import { NotFoundException } from '@nestjs/common'
@EntityRepository(OrderbookEntity)
export class OrderbookRepository extends Repository<OrderbookEntity> {
  async createOrderbook(createOrderData: OrderbookEntityOptional): Promise<OrderbookEntity> {
    const order = this.create(createOrderData)

    await this.save(order)
    return order
  }

  async getOrderbooks(filterDto?: GetOrderbooksFilterDto): Promise<OrderbookEntity[]> {
    const query = this.createQueryBuilder('orderbook')

    if (filterDto.hasOwnProperty('orderStatus')) {
      query.andWhere('orderbook.status = :status', { status: filterDto.orderStatus })
    }

    if (filterDto.hasOwnProperty('isOpen')) {
      query.andWhere('orderbook.isOpen = :isOpen', { isOpen: filterDto.isOpen })
    }
    const tasks = await query.getMany()
    return tasks
  }

  async getOrderbookById(id: string): Promise<OrderbookEntity> {
    const found = this.findOne(id)

    if (!found) {
      throw new NotFoundException(`Orderbook with Id ${id} not found`)
    }

    return found
  }

  async updateOrderBookById(id: string, newData: OrderbookEntityOptional): Promise<OrderbookEntity> {
    // Reflect.ownKeys(newData).forEach((key) => {
    //   farm[key] = newData[key]
    // })
    // // farm.currentTask = newTask
    // await this.save(farm)

    await this.update({ id }, newData)
    const orderbookNow = await this.getOrderbookById(id)
    return orderbookNow
  }
}
