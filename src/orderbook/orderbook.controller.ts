import { Body, Param, Controller, Get, Post, Query } from '@nestjs/common'
import { BotManagerService } from 'src/botManager/bot-manager.service'
import { CreateOrderbookDto } from './dto/CreateOrderbookDto'
import { GetOrderbooksFilterDto } from './dto/GetOrderBooksFilterDto'
import { OrderbookEntity } from './orderbook.entiry'
import { OrderbookService } from './orderbook.service'

@Controller('orderbook')
export class OrderbookController {
  constructor(private readonly orderbookService: OrderbookService, private botManagerService: BotManagerService) {}

  @Post('')
  async createOrderbook(@Body() createOrderbook: CreateOrderbookDto): Promise<OrderbookEntity> {
    const orderbook = await this.orderbookService.createOrder(createOrderbook)
    this.botManagerService.startBotManagerByOrderbookId(orderbook.id, orderbook)
    return orderbook
  }

  @Get()
  async getOrderbooks(@Query() getOrderbooksFilterDto: GetOrderbooksFilterDto): Promise<OrderbookEntity[]> {
    return this.orderbookService.getOrderbooks(getOrderbooksFilterDto)
  }

  @Get('/:id')
  getOrderbookById(@Param('id') id: string): Promise<OrderbookEntity> {
    return this.orderbookService.getOrderbookById(id)
  }
}
