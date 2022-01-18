import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UtilsModule } from 'src/utils/utils.module'
import { OrderbookController } from './orderbook.controller'
import { OrderbookService } from './orderbook.service'
import { OrderbookRepository } from './orderbook.repository'
import { WardenswapModule } from 'src/wardenswap/wardenswap.module'
@Module({
  imports: [ConfigModule, UtilsModule, WardenswapModule, TypeOrmModule.forFeature([OrderbookRepository])],
  controllers: [OrderbookController],
  providers: [OrderbookService]
})
export class OrderbookModule {}
