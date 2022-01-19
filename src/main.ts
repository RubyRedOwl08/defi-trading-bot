import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { BotManagerService } from './botManager/bot-manager.service'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const botManagerServices = app.get(BotManagerService)
  app.useGlobalPipes(new ValidationPipe())

  await app.listen(3000)

  botManagerServices.startBotManager()
}

process.on('unhandledRejection', (error) => {
  console.log('unhandledRejection Top level error', error)
  process.exit(1)
})

bootstrap()
