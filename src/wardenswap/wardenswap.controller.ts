import { Controller, Get, Query, Param } from '@nestjs/common'
import { GetPriceDto } from './dto/GetPriceDto'
import { WardenswapService } from './wardenswap.service'

@Controller('wardenswap')
export class WardenswapController {
  constructor(private readonly wardenswapService: WardenswapService) {}

  @Get('/current-price')
  async getPrice(@Query() getPriceDto: GetPriceDto) {
    return this.wardenswapService.getCurrentPrice(getPriceDto)
  }
}
