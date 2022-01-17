export enum BotManagerTask {
  CREATE_ORDER = 'CREATE_ORDER',
  CHECK_PRICE = 'CHECK_PRICE'
}

export enum OrderType {
  MARKET_BUY = 'MARKET_BUY',
  MARKET_SELL = 'MARKET_SELL',
  BUY_LIMIT = 'BUY_LIMIT',
  SELL_LIMIT = 'SELL_LIMIT',
  BUY_STOP = 'BUY_STOP',
  SELL_STOP = 'SELL_STOP'
}

export enum OrderStatus {
  UNKNOWN = 'UNKNOWN',
  SUCCESS = 'SUCCESS',
  CANCELED = 'CANCELED',
  FAILED = 'FAILED',
  PENDING = 'PENDING'
}

// import { FarmEntity } from '../bot-manager.entiry'

// export type FarmEntityOptional = Partial<FarmEntity>
