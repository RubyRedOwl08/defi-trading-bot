import { Body, Param, Controller, Get, Post } from '@nestjs/common'
import { InjectConfig } from 'nestjs-config'
import { CreateOrderbookDto } from './dto/CreateOrderDto'
import { OrderbookEntity } from './orderbook.entiry'
import { OrderbookService } from './orderbook.service'

@Controller('orderbook')
export class OrderbookController {
  constructor(
    @InjectConfig()
    private readonly config,
    private readonly orderbookService: OrderbookService
  ) {}

  @Post('')
  createOrder(@Body() createOrderDto: CreateOrderbookDto): Promise<OrderbookEntity> {
    return this.orderbookService.createOrder(createOrderDto)
  }
}
