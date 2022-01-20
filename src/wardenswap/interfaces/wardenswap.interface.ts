import { WardenBestRate as WardenBestRateSdk } from '@wardenswap/bestrate-sdk'
type UnPromisify<T> = T extends Promise<infer U> ? U : T

export type GetQuote = UnPromisify<ReturnType<typeof WardenBestRateSdk.prototype.getQuote>>

export enum MethodNameForTrade {
  TRADE_STRATEGIES = 'swap',
  SPLIT_TRADES = 'swapSplit',
  TRADE_ETH_TO_WETH = 'tradeEthToWeth',
  TRADE_WETH_TO_ETH = 'tradeWethToEth'
}

export interface Token {
  name: string
  symbol: string
  address: string
  chainId?: number
  decimals: number
  logoURI?: string | undefined
}

export interface TransactionReceiptData {
  srcAssetAddress: string
  destAssetAddress: string
  srcAmountInBase: string
  srcAmountInWei: string
  destAmountInBase: string
  destAmountInWei: string
  srcAssetData: Token
  destAssetData: Token
  transactionFee: string
}
