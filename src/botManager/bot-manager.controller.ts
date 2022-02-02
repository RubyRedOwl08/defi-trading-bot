import { Controller } from '@nestjs/common'
import { BotManagerService } from './bot-manager.service'
import { BotManagerTaskService } from './bot-manager.task'
import { InjectConfig } from 'nestjs-config'

@Controller('bot-manager')
export class BotManagerController {}
