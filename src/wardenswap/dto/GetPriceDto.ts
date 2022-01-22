import { IsNotEmpty, IsEthereumAddress, IsNumberString, IsOptional } from 'class-validator'

export class GetPriceDto {
  @IsNotEmpty()
  @IsEthereumAddress()
  srcTokenAddress: string

  @IsNotEmpty()
  @IsEthereumAddress()
  destTokenAddress: string

  @IsNumberString()
  @IsOptional()
  srcAmount: string
}
