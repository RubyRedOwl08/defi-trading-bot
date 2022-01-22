import { Controller, Get, Query } from '@nestjs/common'
import { GetPriceDto } from './dto/GetPriceDto'
import { WardenswapService } from './wardenswap.service'

@Controller('wardenswap')
export class WardenswapController {
  constructor(private readonly wardenswapService: WardenswapService) {}
  @Get('/price-swap')
  async getPrice(@Query() getPriceDto: GetPriceDto) {
    return this.wardenswapService.getPriceSwap(getPriceDto)
  }
}
