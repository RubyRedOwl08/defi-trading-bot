import { Injectable, Logger } from '@nestjs/common'
import { WardenBestRate as WardenBestRateSdk } from '@wardenswap/bestrate-sdk'
import { TransactionResponse, TransactionReceipt } from 'nestjs-ethers'
import { ethers, Contract, utils, BigNumber as BigNumberForEthers } from 'ethers'
import BigNumber from 'bignumber.js'
import { getAddress } from 'nestjs-ethers'
import { EthersConnectService } from 'src/ethersConnect/ethers.service'
import { UtilsService } from 'src/utils/utils.service'
import { GetQuote, MethodNameForTrade, TransactionReceiptData, Token } from './interfaces/wardenswap.interface'
import { ConfigService } from '@nestjs/config'
import { NETWORK_CONSTANT } from 'src/constants'
import { ApprovalState } from 'src/ethersConnect/interfaces/ethers.interface'
@Injectable()
export class WardenswapService {
  private wardenBestRateSdk: WardenBestRateSdk
  private logger = new Logger('WardenswapService')
  constructor(private ethersConnectService: EthersConnectService, private utilsService: UtilsService) {
    this.wardenBestRateSdk = new WardenBestRateSdk(this.ethersConnectService.bscProvider, 'bsc')
  }

  async getRate(
    tokenAAddress: string,
    tokenBAddress: string,
    amountInWei: string,
    enableSplit = false,
    fetchDepositAddresses = false
  ): Promise<GetQuote> {
    const quote = await this.wardenBestRateSdk.getQuote(
      tokenAAddress,
      tokenBAddress,
      BigNumberForEthers.from(amountInWei),
      ethers.utils.parseUnits('5', 'gwei'), // TODO: for bsc
      { enableSplit, fetchDepositAddresses }
    )
    return quote
  }

  async tradeToken(tokenAAddress: string, tokenBAddress: string, tokenAAmountInWei: string) {
    this.logger.debug('Start trade')
    const wardenRounterAddress = NETWORK_CONSTANT[56].WARDEN_ROUTING_CONTRACT_ADDRESS
    const tokenAData = this.utilsService.getTokenData(tokenAAddress)
    const tokenBData = this.utilsService.getTokenData(tokenBAddress)

    const bestRateResult = await this.getRate(tokenAData.address, tokenBData.address, tokenAAmountInWei, false, true)

    let tradeArgs: Array<any>
    let methodName: MethodNameForTrade
    if (bestRateResult.type === 'strategies') {
      methodName = MethodNameForTrade.TRADE_STRATEGIES
      tradeArgs = this.generateDataForTradeStrategies(
        tokenAData.address,
        tokenBData.address,
        tokenAAmountInWei,
        bestRateResult
      )
    } else if (bestRateResult.type === 'split') {
      throw Error('split not support')
    } else {
      throw new Error(`Function getRate best rate type ${bestRateResult?.type} not support`)
    }

    this.logger.debug('check isAllowanced')
    const approvalState = await this.ethersConnectService.checkIsAllowanced(
      this.ethersConnectService.botWalletAddress,
      tokenAData.address,
      wardenRounterAddress
    )
    this.logger.debug('approvalState', approvalState)
    if (approvalState === ApprovalState.NOT_APPROVED) {
      await this.ethersConnectService.approveToken(tokenAData.address, wardenRounterAddress)
      this.logger.debug('Delay 15s')
      await this.utilsService.delay(1000 * 15)
    }

    this.logger.debug('callMehodTrade')
    const transactionResponse = (await this.callMehodTrade(
      this.ethersConnectService.wardenRoutingContract,
      methodName,
      tradeArgs
    )) as TransactionResponse
    this.logger.debug('tran sactionResponse', transactionResponse)
    const transactionReceipt: TransactionReceipt = await transactionResponse.wait()
    const transactionReceiptData = this.getTransactionReceiptData(transactionReceipt)
    this.logger.debug('transactionReceiptData', transactionReceiptData)

    return transactionReceiptData
  }

  private generateDataForTradeStrategies(
    tokenAAddress: string,
    tokenBAddress: string,
    tokenAAmountInWei: string,
    bestRateResult: GetQuote
  ) {
    if (bestRateResult.type !== 'strategies') {
      return
    }
    const priceSlippage = 10 // 10%
    const tokenAChecksumAddress = getAddress(tokenAAddress)
    const tokenBChecksumAddress = getAddress(tokenBAddress)
    const minDestAmount = new BigNumber(bestRateResult.amountOut.toString())
      .times(new BigNumber(100).minus(priceSlippage))
      .idiv(100)
      .toString(10)

    const defaultArgs = [
      bestRateResult.swapAddress,
      bestRateResult.data,
      bestRateResult.depositAddress,
      tokenAChecksumAddress,
      tokenAAmountInWei,
      tokenBChecksumAddress,
      minDestAmount,
      this.ethersConnectService.botWalletAddress,
      NETWORK_CONSTANT[56].PARTNER_ID,
      '000' // Mock data
    ]

    return defaultArgs
  }

  private async callMehodTrade(
    contract: Contract,
    methodName: MethodNameForTrade,
    args: Array<any>
  ): Promise<TransactionResponse | Error> {
    try {
      console.log('args', JSON.stringify(args, null, 4))
      const estimatedGas = await this.utilsService.estimateGasForContract(contract, methodName, args)
      this.logger.debug('callMehodTrade 2', estimatedGas)
      // Add gasLimit and gasPrice in last index of array
      if (typeof args[args.length - 1] === 'object') {
        args[args.length - 1].gasLimit = estimatedGas
      } else {
        args.push({ gasLimit: estimatedGas })
      }

      const transactionResponse: TransactionResponse = await contract[methodName](...args)
      return transactionResponse
    } catch (error) {
      if (error?.code === 4001) {
        throw new Error('TRANSACTION_REJECTED')
      } else {
        throw new Error(`Swap failed\n ${error.message}`)
      }
    }
  }

  private getTransactionReceiptData(transactionReceipt: TransactionReceipt): TransactionReceiptData {
    // @ts-ignore
    const eventTrade = transactionReceipt?.events.find((event) => event.event === 'Trade')
    const srcAssetData = this.utilsService.getTokenData(eventTrade.args.srcAsset)
    const destAssetData = this.utilsService.getTokenData(eventTrade.args.destAsset)
    const transactionReceiptData: TransactionReceiptData = {
      srcAssetAddress: eventTrade.args.srcAsset,
      destAssetAddress: eventTrade.args.destAsset,
      srcAssetData: srcAssetData,
      destAssetData: destAssetData,
      srcAmountInWei: eventTrade.args.srcAmount.toString(),
      srcAmountInBase: utils.formatUnits(eventTrade.args.srcAmount, srcAssetData.decimals).toString(),
      destAmountInWei: eventTrade.args.destAmount.toString(),
      destAmountInBase: utils.formatUnits(eventTrade.args.destAmount, destAssetData.decimals).toString()
    }

    return transactionReceiptData
  }
}
