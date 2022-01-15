import { Module } from '@nestjs/common'
import { AwsSdkConfigServices } from './aws-sdk-config.service'

@Module({
  providers: [AwsSdkConfigServices],
  exports: [AwsSdkConfigServices]
})
export class AwsSdkConfigModule {}
