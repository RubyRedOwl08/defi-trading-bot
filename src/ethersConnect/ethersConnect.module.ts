import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { EthersModule, BINANCE_NETWORK } from 'nestjs-ethers'
import { UtilsModule } from 'src/utils/utils.module'
import { EthersConnectService } from './ethers.service'
import { AwsSdkModule } from 'nest-aws-sdk'
import { KMS } from 'aws-sdk'

@Module({
  imports: [
    EthersModule.forRoot({
      network: BINANCE_NETWORK,
      custom: 'https://bsc-dataseed.binance.org/',
      useDefaultProvider: false
    }),
    AwsSdkModule.forFeatures([KMS]),
    ConfigModule,
    UtilsModule
  ],
  providers: [EthersConnectService],
  exports: [EthersConnectService]
})
export class EthersConnectModule {}
