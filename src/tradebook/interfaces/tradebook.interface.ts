export enum TradebookType {
  STRATEGIES = 'STRATEGIES',
  SPLIT = 'SPLIT'
}

import { TradebookEntity } from '../tradebook.entity'

export type TradebookEntityOptional = Partial<TradebookEntity>
