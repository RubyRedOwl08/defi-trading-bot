export enum OrderbookType {
  MARKET = 'MARKET',
  STOP_LIMIT = 'STOP_LIMIT'
}

export enum OrderbookStatus {
  UNKNOWN = 'UNKNOWN',
  SUCCESS = 'SUCCESS',
  CANCELED = 'CANCELED',
  FAILED = 'FAILED',
  PENDING = 'PENDING'
}

import { OrderbookEntity } from '../orderbook.entiry'

export type OrderbookEntityOptional = Partial<OrderbookEntity>
