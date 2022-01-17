import { IsNotEmpty, IsEthereumAddress, IsNumberString } from 'class-validator'
import { OrderType } from '../interfaces/bot-manager.interface'

export class CreateOrderDto {
  @IsNotEmpty()
  @IsEthereumAddress()
  srcTokenAddress: string

  @IsNotEmpty()
  @IsEthereumAddress()
  descTokenAddress: string

  @IsNotEmpty()
  orderType: OrderType

  @IsNumberString()
  tragetPrice: string
}
