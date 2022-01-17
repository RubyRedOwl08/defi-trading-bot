import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { EthersConnectModule } from 'src/ethersConnect/ethersConnect.module'
import { UtilsModule } from 'src/utils/utils.module'
import { WardenswapModule } from 'src/wardenswap/wardenswap.module'
import { FarmRepository } from './bot-manager.repository'
import { BotManagerService } from './bot-manager.service'
import { BotManagerController } from './bot-manager.controller'
import { BotManagerTaskService } from './bot-manager.task'

@Module({
  imports: [
    ConfigModule,
    EthersConnectModule,
    UtilsModule,
    WardenswapModule,
    TypeOrmModule.forFeature([FarmRepository])
  ],
  providers: [BotManagerService, BotManagerTaskService],
  controllers: [BotManagerController]
})
export class BotManagerModule {}
