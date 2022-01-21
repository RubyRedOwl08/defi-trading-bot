import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { EthersConnectModule } from 'src/ethersConnect/ethersConnect.module'
import { UtilsModule } from 'src/utils/utils.module'
import { WardenswapModule } from 'src/wardenswap/wardenswap.module'
import { BotManagerService } from './bot-manager.service'
import { BotManagerController } from './bot-manager.controller'
import { BotManagerTaskService } from './bot-manager.task'
import { TypeOrmModule } from '@nestjs/typeorm'
import { OrderbookRepository } from 'src/orderbook/orderbook.repository'
import { TradebookModule } from 'src/tradebook/tradebook.module'

@Module({
  imports: [
    ConfigModule,
    EthersConnectModule,
    UtilsModule,
    WardenswapModule,
    TradebookModule,
    TypeOrmModule.forFeature([OrderbookRepository])
  ],
  providers: [BotManagerService, BotManagerTaskService],
  controllers: [BotManagerController],
  exports: [BotManagerService]
})
export class BotManagerModule {}
