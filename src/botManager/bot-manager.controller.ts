import { Controller } from '@nestjs/common'
import { BotManagerService } from './bot-manager.service'
import { BotManagerTaskService } from './bot-manager.task'
import { InjectConfig } from 'nestjs-config'
// import { BotManagerTask } from './interfaces/bot-manager.interface'

@Controller('bot-manager')
export class BotManagerController {
  constructor(
    @InjectConfig()
    private readonly config,
    private botManagerService: BotManagerService,
    private botManagerTeskService: BotManagerTaskService
  ) {}
}
