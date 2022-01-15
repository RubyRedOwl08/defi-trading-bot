import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm'

@Injectable()
export class PostgresConfigService implements TypeOrmOptionsFactory {
  constructor(private configSrtvice: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.configSrtvice.get<string>('POSTGRES_HOST'),
      port: this.configSrtvice.get<number>('POSTGRES_PORT'),
      username: this.configSrtvice.get<string>('POSTGRES_USERNAME'),
      password: this.configSrtvice.get<string>('POSTGRES_PASSWORD'),
      database: this.configSrtvice.get<string>('POSTGRES_DATABASE'),
      autoLoadEntities: this.configSrtvice.get<boolean>('POSTGRES_AUTO_LOAD_ENTITIES'),
      synchronize: this.configSrtvice.get<boolean>('POSTGRES_SYNCHRONIZE')
    }
  }
}
