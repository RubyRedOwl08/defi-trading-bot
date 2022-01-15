import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  await app.listen(3000)
}

process.on('unhandledRejection', (error) => {
  console.log('unhandledRejection Top level error', error)
  process.exit(1)
})

bootstrap()
