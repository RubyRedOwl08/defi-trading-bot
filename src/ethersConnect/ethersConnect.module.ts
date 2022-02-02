import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { EthersModule, BINANCE_NETWORK } from 'nestjs-ethers'
import { AwsSdkModule } from 'nest-aws-sdk'
import { KMS } from 'aws-sdk'
import { UtilsModule } from 'src/utils/utils.module'
import { EthersConnectService } from './ethers.service'
import { NETWORK_CONSTANT } from '../constants/index'

@Module({
  imports: [
    EthersModule.forRoot({
      network: BINANCE_NETWORK,
      custom: NETWORK_CONSTANT[56].RPC_OFFICIAL_URL,
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
