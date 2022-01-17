import { Injectable, Logger } from '@nestjs/common'
import { BotManagerTask } from './interfaces/bot-manager.interface'
import { InjectConfig } from 'nestjs-config'

@Injectable()
export class BotManagerTaskService {
  private logger = new Logger('BotManagerTaskService')
  constructor(
    @InjectConfig()
    private readonly config
  ) {}

  emitBotManagerTask(taskId: string, taskName: BotManagerTask) {
    this.config.set('botManager.tasks', {
      [taskId]: {
        taskId,
        taskName,
        isRunEvent: true
      }
    })
  }

  daleteBotManagerTask(taskId: string) {
    const allTask = this.config.get(`botManager.tasks`)
    console.log('allTask', allTask)
    delete allTask[taskId]
    this.config.set(`botManager.tasks`, allTask)
  }
}
