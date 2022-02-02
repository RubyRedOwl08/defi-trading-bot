import { Injectable, Logger } from '@nestjs/common'
import { WardenBestRate as WardenBestRateSdk } from '@wardenswap/bestrate-sdk'
import { TransactionResponse, TransactionReceipt } from 'nestjs-ethers'
import { ethers, Contract, utils, BigNumber as BigNumberForEthers } from 'ethers'
import BigNumber from 'bignumber.js'
import { getAddress } from 'nestjs-ethers'
import { EthersConnectService } from 'src/ethersConnect/ethers.service'
import { UtilsService } from 'src/utils/utils.service'
import { GetQuote, MethodNameForTrade, TransactionSummary, Token } from './interfaces/wardenswap.interface'
import { NETWORK_CONSTANT, USD_AMOUNT_FOR_CALC_TOKEN_PRICE } from 'src/constants'
import { ApprovalState } from 'src/ethersConnect/interfaces/ethers.interface'
import { GetPriceDto } from './dto/GetPriceDto'
import wardenRoutingAbi from '../contracts/abis/WardenRoutingAbi.json'
const wardenRoutingInterface = new ethers.utils.Interface(wardenRoutingAbi)

@Injectable()
export class WardenswapService {
  private wardenBestRateSdk: WardenBestRateSdk
  private logger = new Logger('WardenswapService')
  constructor(private ethersConnectService: EthersConnectService, private utilsService: UtilsService) {
    this.wardenBestRateSdk = new WardenBestRateSdk(this.ethersConnectService.bscProvider, 'bsc')
  }

  async getRate(
    srcTokenAddress: string,
    destTokenAddress: string,
    amountInWei: string,
    enableSplit = false
  ): Promise<GetQuote> {
    const quote = await this.wardenBestRateSdk.getQuote(
      srcTokenAddress,
      destTokenAddress,
      BigNumberForEthers.from(amountInWei),
      ethers.utils.parseUnits('5', 'gwei'), // * For BSC chain
      { enableSplit: enableSplit }
    )
    return quote
  }

  async getCurrentPrice(getPriceDto: GetPriceDto) {
    const srcTokenData = this.utilsService.getTokenData(getPriceDto.srcTokenAddress)
    const destTokenData = this.utilsService.getTokenData(getPriceDto.destTokenAddress)
    const srcAmountInWei = ethers.utils.parseUnits(getPriceDto.srcAmount, srcTokenData.decimals).toString()

    const bestRateResult = await this.getRate(getPriceDto.srcTokenAddress, getPriceDto.destTokenAddress, srcAmountInWei)
    const amountOutBase = ethers.utils.formatUnits(bestRateResult.amountOut.toString(), destTokenData.decimals)
    const currentPrice = new BigNumber(amountOutBase).div(getPriceDto.srcAmount).toString(10)

    return { currentPrice }
  }

  async getTokenPriceUsd(tokenAddress: string) {
    const tokenData = this.utilsService.getTokenData(tokenAddress)
    const stableCoin = NETWORK_CONSTANT[56].STABLE_COIN_TOKEN as Token
    if (getAddress(stableCoin.address) === getAddress(tokenAddress)) {
      return '1'
    }
    const usdAmountForCalcTokenPriceWei = utils
      .parseUnits(USD_AMOUNT_FOR_CALC_TOKEN_PRICE.toString(), stableCoin.decimals)
      .toString()

    const bestRateResult = await this.getRate(stableCoin.address, tokenAddress, usdAmountForCalcTokenPriceWei)
    this.utilsService.checkBestRateAmountOut(bestRateResult)

    const amountOutBase = utils.formatUnits(bestRateResult.amountOut.toString(), tokenData.decimals).toString()
    const priceUsd = new BigNumber(USD_AMOUNT_FOR_CALC_TOKEN_PRICE).div(amountOutBase).toString(10)

    return priceUsd
  }

  async tradeToken(srcTokenAddress: string, destTokenAddress: string, srcAmountInWei: string) {
    const wardenRounterAddress = NETWORK_CONSTANT[56].WARDEN_ROUTING_CONTRACT_ADDRESS
    const srcTokenData = this.utilsService.getTokenData(srcTokenAddress)
    const destTokenData = this.utilsService.getTokenData(destTokenAddress)

    const bestRateResult = await this.getRate(srcTokenData.address, destTokenData.address, srcAmountInWei, true)

    this.utilsService.checkBestRateAmountOut(bestRateResult, srcTokenData.symbol, destTokenData.symbol)

    let tradeArgs: Array<any>
    let methodName: MethodNameForTrade
    if (bestRateResult.type === 'strategies') {
      methodName = MethodNameForTrade.TRADE_STRATEGIES
      tradeArgs = this.generateDataForTradeStrategies(
        srcTokenData.address,
        destTokenData.address,
        srcAmountInWei,
        bestRateResult
      )
    } else if (bestRateResult.type === 'split') {
      methodName = MethodNameForTrade.TRADE_SPLIT
      tradeArgs = this.generateDataForTradeSplit(
        srcTokenData.address,
        destTokenData.address,
        srcAmountInWei,
        bestRateResult
      )
    } else {
      throw new Error(`Function getRate best rate type ${bestRateResult?.type} not support`)
    }
    this.logger.log(`Trade method name: ${methodName}`)

    if (getAddress(srcTokenData.address) === getAddress(NETWORK_CONSTANT[56].NATIVE_TOKEN.address)) {
      tradeArgs.push({ value: srcAmountInWei })
    }

    this.logger.log('Check isAllowanced')
    const approvalState = await this.ethersConnectService.checkIsAllowanced(
      this.ethersConnectService.botWalletAddress,
      srcTokenData.address,
      wardenRounterAddress
    )
    this.logger.log(`Approval State ${approvalState}`)
    if (approvalState === ApprovalState.NOT_APPROVED) {
      await this.ethersConnectService.approveToken(srcTokenData.address, wardenRounterAddress)
      this.logger.log('Delay 15s')
      await this.utilsService.delay(1000 * 15)
    }

    const transactionResponse = (await this.callMehodTrade(
      this.ethersConnectService.wardenRoutingContract,
      methodName,
      tradeArgs
    )) as TransactionResponse
    const transactionReceipt: TransactionReceipt = await transactionResponse.wait()
    const transactionReceiptData = this.getTransactionSummary(transactionResponse, transactionReceipt)

    return transactionReceiptData
  }

  private generateDataForTradeStrategies(
    srcTokenAddress: string,
    destTokenAddress: string,
    srcAmountInWei: string,
    bestRateResult: GetQuote
  ) {
    if (bestRateResult.type !== 'strategies') {
      return
    }
    const priceSlippage = 10 // 10%
    const srcTokenChecksumAddress = getAddress(srcTokenAddress)
    const destTokenChecksumAddress = getAddress(destTokenAddress)
    const minDestAmount = new BigNumber(bestRateResult.amountOut.toString())
      .times(new BigNumber(100).minus(priceSlippage))
      .idiv(100)
      .toString(10)

    const defaultArgs = [
      bestRateResult.swapAddress,
      bestRateResult.data,
      bestRateResult.depositAddress,
      srcTokenChecksumAddress,
      srcAmountInWei,
      destTokenChecksumAddress,
      minDestAmount,
      this.ethersConnectService.botWalletAddress,
      NETWORK_CONSTANT[56].PARTNER_ID,
      '0'
    ]

    return defaultArgs
  }

  private generateDataForTradeSplit(
    srcTokenAddress: string,
    destTokenAddress: string,
    srcAmountInWei: string,
    bestRateResult: GetQuote
  ) {
    if (bestRateResult.type !== 'split') {
      return
    }
    const priceSlippage = 10 // 10%
    const srcTokenChecksumAddress = getAddress(srcTokenAddress)
    const destTokenChecksumAddress = getAddress(destTokenAddress)
    const minDestAmount = new BigNumber(bestRateResult.amountOut.toString())
      .times(new BigNumber(100).minus(priceSlippage))
      .idiv(100)
      .toString(10)

    const defaultArgs = [
      bestRateResult.swapAddress,
      bestRateResult.data,
      bestRateResult.depositAddresses,
      bestRateResult.volumns,
      srcTokenChecksumAddress,
      srcAmountInWei,
      destTokenChecksumAddress,
      minDestAmount,
      this.ethersConnectService.botWalletAddress,
      NETWORK_CONSTANT[56].PARTNER_ID,
      '0'
    ]

    return defaultArgs
  }

  private async callMehodTrade(
    contract: Contract,
    methodName: MethodNameForTrade,
    args: Array<any>
  ): Promise<TransactionResponse | Error> {
    try {
      const estimatedGas = await this.utilsService.estimateGasForContract(contract, methodName, args)
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

  private getTransactionSummary(
    transactionResponse: TransactionResponse,
    transactionReceipt: TransactionReceipt
  ): TransactionSummary {
    // @ts-ignore
    const eventTrade = transactionReceipt?.events.find((event) => event.event === 'Trade')
    const srcAssetData = this.utilsService.getTokenData(eventTrade.args.srcAsset)
    const destAssetData = this.utilsService.getTokenData(eventTrade.args.destAsset)
    const txFeeInWei = new BigNumber(transactionReceipt.gasUsed.toString())
      .times(ethers.utils.parseUnits('5', 'gwei').toString())
      .toString()

    const txFeeInBase = utils.formatEther(txFeeInWei)
    let tradeMethodName = ''
    try {
      const decodedInput = wardenRoutingInterface.parseTransaction({
        data: transactionResponse.data,
        value: transactionResponse.value
      })
      tradeMethodName = decodedInput.name
    } catch (error) {
      this.logger.error(error.message, error)
    }
    const transactionSummary: TransactionSummary = {
      transactionHash: transactionReceipt.transactionHash,
      srcAssetAddress: eventTrade.args.srcAsset,
      destAssetAddress: eventTrade.args.destAsset,
      srcAssetData: srcAssetData,
      destAssetData: destAssetData,
      srcAmountInWei: eventTrade.args.srcAmount.toString(),
      srcAmountInBase: utils.formatUnits(eventTrade.args.srcAmount, srcAssetData.decimals).toString(),
      destAmountOutWei: eventTrade.args.destAmount.toString(),
      destAmountOutBase: utils.formatUnits(eventTrade.args.destAmount, destAssetData.decimals).toString(),
      transactionFee: txFeeInBase,
      tradeMethodName
    }

    return transactionSummary
  }
}
