import { IsNotEmpty, IsEthereumAddress, IsNumberString, IsString, IsOptional, MaxLength } from 'class-validator'
import { OrderbookType } from '../interfaces/orderbook.interface'
export class CreateOrderbookDto {
  @IsNotEmpty()
  @IsEthereumAddress()
  srcTokenAddress: string

  @IsNotEmpty()
  @IsEthereumAddress()
  descTokenAddress: string

  @IsNotEmpty()
  orderType: OrderbookType

  @IsNumberString()
  tragetPrice: string

  @IsString()
  @IsOptional()
  @MaxLength(200)
  description: string
}
