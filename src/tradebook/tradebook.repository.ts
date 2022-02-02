import { EntityRepository, Repository } from 'typeorm'
import { TradebookEntity } from './tradebook.entity'

@EntityRepository(TradebookEntity)
export class TradebookRepository extends Repository<TradebookEntity> {
  async createTradebook(tradeData, orderbookId: string) {
    tradeData.orderbookId = orderbookId
    const trade = this.create(tradeData)
    await this.save(trade)

    return trade
  }
}
