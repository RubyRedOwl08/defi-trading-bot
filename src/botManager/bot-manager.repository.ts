// import { NotFoundException } from '@nestjs/common'
import { EntityRepository, Repository } from 'typeorm'
// import { GetOrdersFilterDto } from './dto/GetOrdersFilterDto'
import { OrderEntity } from './bot-manager.entiry'
// import { BotManagerTask } from './interfaces/bot-manager.interface'
// import { CreateOrderDto } from './dto/CreateOrderDto'
// import { getAddress } from 'nestjs-ethers'

@EntityRepository(OrderEntity)
export class FarmRepository extends Repository<OrderEntity> {
  async createFarm(createOrderData: any): Promise<OrderEntity> {
    const order = this.create({
      srcTokenAddress: createOrderData.srcTokenAddress,
      srcTokenSymbol: createOrderData.srcTokenSymbol,
      descTokenAddress: createOrderData.descTokenAddress,
      descTokenSymbol: createOrderData.descTokenSymbol,
      tragetPrice: createOrderData.tragetPrice,
      type: createOrderData.type,
      status: createOrderData.status
    })

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
