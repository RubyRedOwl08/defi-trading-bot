import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UtilsModule } from 'src/utils/utils.module'
import { OrderbookController } from './orderbook.controller'
import { OrderbookService } from './orderbook.service'
import { OrderbookRepository } from './orderbook.repository'
@Module({
  imports: [ConfigModule, UtilsModule, TypeOrmModule.forFeature([OrderbookRepository])],
  controllers: [OrderbookController],
  providers: [OrderbookService]
})
export class OrderbookModule {}
