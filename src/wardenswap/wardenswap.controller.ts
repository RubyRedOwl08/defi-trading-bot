import { Controller, Get, Query, Param } from '@nestjs/common'
import { GetPriceDto } from './dto/GetPriceDto'
import { WardenswapService } from './wardenswap.service'

@Controller('wardenswap')
export class WardenswapController {
  constructor(private readonly wardenswapService: WardenswapService) {}
  @Get('/price-swap')
  async getPrice(@Query() getPriceDto: GetPriceDto) {
    return this.wardenswapService.getPriceSwap(getPriceDto)
  }

  @Get('/test/:address')
  async test(@Param('address') address: string) {
    return this.wardenswapService.getTokenPriceUsd(address)
  }
}
