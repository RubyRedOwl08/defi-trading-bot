import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { UtilsModule } from './utils/utils.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AwsSdkModule } from 'nest-aws-sdk'
import * as path from 'path'

import { ConfigModule as ConfigModuleByLib } from 'nestjs-config'
import { PostgresConfigService } from './postgresConfig/postgres-config.service'
import { EthersConnectModule } from './ethersConnect/ethersConnect.module'
import { AwsSdkConfigServices } from './awsSdkConfig/aws-sdk-config.service'
import { AwsSdkConfigModule } from './awsSdkConfig/aws-sdk-config.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useClass: PostgresConfigService,
      inject: [PostgresConfigService]
    }),
    AwsSdkModule.forRootAsync({
      defaultServiceOptions: {
        useFactory: (cs: AwsSdkConfigServices) => {
          return cs.getConfigOptions()
        },
        inject: [AwsSdkConfigServices],
        imports: [AwsSdkConfigModule]
      }
    }),
    ConfigModuleByLib.load(path.resolve(__dirname, 'config', '**/!(*.d).{ts,js}')),
    EthersConnectModule,
    UtilsModule,
    AwsSdkConfigModule
  ],
  controllers: [AppController],
  providers: [AppService, PostgresConfigService]
})
export class AppModule {}
