import { Body, Param, Controller, Get, Post, Patch } from '@nestjs/common'
import { OrderEntity } from './bot-manager.entiry'
import { BotManagerService } from './bot-manager.service'
import { BotManagerTaskService } from './bot-manager.task'
import { InjectConfig } from 'nestjs-config'
// import { BotManagerTask } from './interfaces/bot-manager.interface'
import { CreateOrderDto } from './dto/CreateOrderDto'

@Controller('bot-manager')
export class BotManagerController {
  // farmService: FarmService
  constructor(
    @InjectConfig()
    private readonly config,
    private botManagerService: BotManagerService,
    private botManagerTeskService: BotManagerTaskService
  ) {}

  @Post('/order')
  createOrder(@Body() createOrderDto: CreateOrderDto): Promise<OrderEntity> {
    return this.botManagerService.createOrder(createOrderDto)
  }

  // @Get()
  // getOrders() {
  //   // TODO: fixed
  //   return this.botManagerService.
  // }
  // TODO: fixed
  // @Patch('stopFarm')
  // stopFarm(@Body() dto: any) {
  //   const { farmId } = dto
  //   // this.farmTeskService.updateFarmTask(farmId, { isRunEvent: false })
  //   this.config.set(`farm.tasks.${farmId}.isRunEvent`, false)
  //   const t3 = this.config.get(`farm.tasks.${farmId}`)
  //   console.log('t3==>', t3)
  //   return
  // }
}
