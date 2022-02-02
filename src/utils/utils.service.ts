import { Injectable, NotFoundException } from '@nestjs/common'
import bscTokenList from '../constants/bsc/bscTokenList.json'
import erc20Abi from '../contracts/abis/erc20.json'
import BigNumber from 'bignumber.js'
import { ethers } from 'ethers'
import { Contract } from 'nestjs-ethers'
import { GetQuote } from '../wardenswap/interfaces/wardenswap.interface'
@Injectable()
export class UtilsService {
  getTokenData(search: string) {
    const tokenData = bscTokenList.tokens.find((token) => {
      const searchUpperCase = search.toUpperCase()
      const isAddress = token.address.toUpperCase() === searchUpperCase
      const isSymbol = token.symbol.toUpperCase() === searchUpperCase

      return isAddress || isSymbol
    })

    return tokenData
  }

  calculateGasMargin(value: string | number): string {
    return new BigNumber(value).multipliedBy('1.25').toFixed(0)
  }

  parseLogTransferToken(eventLog: ethers.providers.Log): ethers.utils.LogDescription | undefined {
    try {
      const inter = new ethers.utils.Interface(erc20Abi)
      const logData = inter.parseLog(eventLog)

      return logData
    } catch (error) {
      console.log('error', error)
    }
  }

  async waitUntil(condition) {
    return await new Promise((resolve) => {
      const interval = setInterval(() => {
        if (condition) {
          resolve(true)
          clearInterval(interval)
        }
      }, 1000)
    })
  }

  delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  public estimateGasForContract(contract: Contract, methodName: string, args: Array<any>): Promise<string> {
    return contract.estimateGas[methodName](...args)
      .then((gasEstimate: any) => {
        return this.calculateGasMargin(gasEstimate.toString())
      })
      .catch((gasError: any) => {
        throw new Error(gasError?.data?.message || gasError.message)
      })
  }

  public myPromise(obj: any, functionName: string, params) {
    return new Promise((resolve, reject) => {
      obj[functionName](params, (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    })
  }

  public checkBestRateAmountOut(bestRateResult: GetQuote, srcTokenSymbol?: string, destTokenSymbol?: string) {
    const amountOutInWei = bestRateResult.amountOut.toString()
    if (new BigNumber(amountOutInWei).isZero() || new BigNumber(amountOutInWei).isNaN()) {
      const tokenPairText = srcTokenSymbol && destTokenSymbol ? ` ${srcTokenSymbol}-${destTokenSymbol} ` : ' '
      throw new NotFoundException(`Not enough liquidity for ${tokenPairText} swapping pairs.`)
    }
  }
}
