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
          status: OrderbookStatus.UNKNOWN
        },
        createOrderData.hasOwnProperty('description') ? { description: createOrderData.description } : null
      )
    )

    await this.save(order)
    return order
  }

  // async getFarms(filterDto?: GetOrdersFilterDto): Promise<FarmEntity[]> {
  //   const query = this.createQueryBuilder('farm')

  //   if (filterDto.hasOwnProperty('isOpen')) {
  //     query.andWhere('farm.isOpen = :isOpen', { isOpen: filterDto.isOpen })
  //   }

  //   // if (search) {
  //   //   query.andWhere('LOWER(task.title) LIKE LOWER(:search) OR LOWER(task.description) LIKE LOWER(:search)', { search: `%${search}%` })
  //   // }
  //   const tasks = await query.getMany()
  //   return tasks
  // }

  // async getFarmById(id: string): Promise<FarmEntity> {
  //   const found = await this.findOne(id)
  //   if (!found) {
  //     throw new NotFoundException(`Farm with Id ${id} not found`)
  //   }
  //   return found
  // }

  // // TODO: fixed
  // async updateFarmById(id: string, newData: any): Promise<FarmEntity> {
  //   const farm = await this.getFarmById(id)
  //   Reflect.ownKeys(newData).forEach((key) => {
  //     farm[key] = newData[key]
  //   })
  //   // farm.currentTask = newTask
  //   await this.save(farm)
  //   return farm
  // }
}
