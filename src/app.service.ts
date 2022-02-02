import { Injectable } from '@nestjs/common'

@Injectable()
export class AppService {
  serverOk(): string {
    return 'Defi trading bot OK'
  }
}
