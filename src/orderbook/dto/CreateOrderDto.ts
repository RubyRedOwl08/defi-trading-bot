import { IsNotEmpty, IsEthereumAddress, IsNumberString, IsString, IsOptional, MaxLength } from 'class-validator'
import { OrderbookType } from '../interfaces/orderbook.interface'
export class CreateOrderbookDto {
  @IsNotEmpty()
  @IsEthereumAddress()
  srcTokenAddress: string

  @IsNotEmpty()
  @IsEthereumAddress()
  descTokenAddress: string

  @IsNumberString()
  srcAmount: string

  @IsNumberString()
  tragetPrice: string

  @IsNotEmpty()
  orderType: OrderbookType

  @IsString()
  @IsOptional()
  @MaxLength(200)
  description: string

  @IsNumberString()
  @IsOptional()
  priceSlippagePercent
}
