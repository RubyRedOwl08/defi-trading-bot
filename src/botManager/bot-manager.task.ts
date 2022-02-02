import { Injectable } from '@nestjs/common'
import { BotManagerTask } from './interfaces/bot-manager.interface'
import { InjectConfig } from 'nestjs-config'

@Injectable()
export class BotManagerTaskService {
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
    delete allTask[taskId]
    this.config.set(`botManager.tasks`, allTask)
  }
}
