import { Module } from '@nestjs/common'
import { EthersConnectModule } from 'src/ethersConnect/ethersConnect.module'
import { UtilsModule } from 'src/utils/utils.module'
import { WardenswapService } from './wardenswap.service'
import { WardenswapController } from './wardenswap.controller'

@Module({
  imports: [EthersConnectModule, UtilsModule],
  providers: [WardenswapService],
  exports: [WardenswapService],
  controllers: [WardenswapController]
})
export class WardenswapModule {}
