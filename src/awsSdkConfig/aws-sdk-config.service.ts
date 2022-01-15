import { Injectable } from '@nestjs/common'
import { SharedIniFileCredentials } from 'aws-sdk'

@Injectable()
export class AwsSdkConfigServices {
  getConfigOptions() {
    return {
      region: 'ap-southeast-1',
      credentials: new SharedIniFileCredentials({
        profile: 'defi-trading-bot'
      })
    }
  }
}
