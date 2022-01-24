import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { SharedIniFileCredentials } from 'aws-sdk'

@Injectable()
export class AwsSdkConfigServices {
  constructor(private configSrtvice: ConfigService) {}
  getConfigOptions() {
    return {
      region: 'ap-southeast-1',
      credentials: new SharedIniFileCredentials({
        profile: this.configSrtvice.get<string>('AWS_CREDENTIAL_PROFILE_NAME')
      })
    }
  }
}
