import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule } from 'nestjs-config'
import { UtilsModule } from 'src/utils/utils.module'
import { WardenswapModule } from 'src/wardenswap/wardenswap.module'
import { TradebookController } from './tradebook.controller'
import { TradebookRepository } from './tradebook.repository'
import { TradebookService } from './tradebook.service'

@Module({
  imports: [ConfigModule, UtilsModule, WardenswapModule, TypeOrmModule.forFeature([TradebookRepository])],
  controllers: [TradebookController],
  providers: [TradebookService],
  exports: [TradebookService]
})
export class TradebookModule {}
