import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UtilsModule } from 'src/utils/utils.module'
import { OrderbookController } from './orderbook.controller'
import { OrderbookService } from './orderbook.service'
import { OrderbookRepository } from './orderbook.repository'
import { WardenswapModule } from 'src/wardenswap/wardenswap.module'
import { EthersConnectModule } from 'src/ethersConnect/ethersConnect.module'
import { BotManagerModule } from 'src/botManager/bot-manager.module'
@Module({
  imports: [
    ConfigModule,
    UtilsModule,
    WardenswapModule,
    EthersConnectModule,
    BotManagerModule,
    TypeOrmModule.forFeature([OrderbookRepository])
  ],
  controllers: [OrderbookController],
  providers: [OrderbookService]
})
export class OrderbookModule {}
