import { Module } from '@nestjs/common'
import { ConfigModule } from 'nestjs-config'
import { UtilsModule } from 'src/utils/utils.module'
import { TradebookController } from './tradebook.controller'
import { TradebookService } from './tradebook.service'

@Module({
  imports: [ConfigModule, UtilsModule],
  controllers: [TradebookController],
  providers: [TradebookService]
})
export class TradebookModule {}
