import { Body, Param, Controller, Get, Post, Query } from '@nestjs/common'
import { CreateOrderbookDto } from './dto/CreateOrderbookDto'
import { GetOrderbooksFilterDto } from './dto/GetOrderBooksFilterDto'
import { OrderbookEntity } from './orderbook.entiry'
import { OrderbookService } from './orderbook.service'

@Controller('orderbook')
export class OrderbookController {
  constructor(private readonly orderbookService: OrderbookService) {}

  @Post('')
  createOrderbook(@Body() createOrderbook: CreateOrderbookDto): Promise<OrderbookEntity> {
    return this.orderbookService.createOrder(createOrderbook)
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
