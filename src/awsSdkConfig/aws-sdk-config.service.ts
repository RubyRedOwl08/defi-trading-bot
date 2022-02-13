import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { SharedIniFileCredentials } from 'aws-sdk'

@Injectable()
export class AwsSdkConfigServices {
  constructor(private configSrtvice: ConfigService) {}
  getConfigOptions() {
    const profileName = this.configSrtvice.get<string>('AWS_CREDENTIAL_PROFILE_NAME')
    const options: { region: string; credentials?: SharedIniFileCredentials } = {
      region: this.configSrtvice.get<string>('AWS_REGION')
    }

    if (profileName !== undefined && profileName !== '') {
      options.credentials = new SharedIniFileCredentials({
        profile: profileName
      })
    }

    return options
  }
}
