import { IsNotEmpty, IsOptional, IsBoolean } from 'class-validator'
import { OrderbookStatus } from '../interfaces/orderbook.interface'

export class GetOrderbooksFilterDto {
  @IsOptional()
  @IsNotEmpty()
  orderStatus?: OrderbookStatus

  @IsOptional()
  @IsBoolean()
  isOpen?: boolean
}
