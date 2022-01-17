import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { ethers } from 'ethers'
import BigNumber from 'bignumber.js'
import { UtilsService } from 'src/utils/utils.service'
import { WardenswapService } from 'src/wardenswap/wardenswap.service'
import { FarmRepository } from './bot-manager.repository'
import { OrderEntity } from './bot-manager.entiry'
import { InjectConfig } from 'nestjs-config'
import { BotManagerTaskService } from './bot-manager.task'
import { BotManagerTask, OrderStatus, OrderType } from './interfaces/bot-manager.interface'
import { CreateOrderDto } from './dto/CreateOrderDto'
import { getAddress } from 'nestjs-ethers'

@Injectable()
export class BotManagerService {
  private logger = new Logger('FarmService')
  constructor(
    private utilsService: UtilsService,
    private wardenSwapServeice: WardenswapService,
    private botManagerTaskService: BotManagerTaskService,
    private farmRepository: FarmRepository,
    @InjectConfig() private readonly config
  ) {}

  createOrder(createOrderDto: CreateOrderDto): Promise<OrderEntity> {
    const srcTokenData = this.utilsService.getTokenData(createOrderDto.srcTokenAddress)
    const descTokenData = this.utilsService.getTokenData(createOrderDto.descTokenAddress)

    const exprectedOrder = {
      srcTokenAddress: srcTokenData.address,
      srcTokenSymbol: srcTokenData.symbol,
      descTokenAddress: descTokenData.address,
      descTokenSymbol: descTokenData.symbol,
      tragetPrice: createOrderDto.tragetPrice,
      type: createOrderDto.orderType,
      status: OrderStatus.UNKNOWN
    }
    this.logger.debug('Test create', exprectedOrder)
    return this.farmRepository.createFarm(exprectedOrder)
  }

  // getFarms(): Promise<FarmEntity[]> {
  //   this.logger.debug('try get farms')
  //   return this.farmRepository.getFarms()
  // }

  // async startFarm() {
  //   const farmsOpenList = await this.farmRepository.getFarms({ isOpen: true })
  //   if (!farmsOpenList.length) {
  //     return
  //   }
  //   farmsOpenList.forEach(({ id }) => {
  //     this.startBotManagerByOrderId(id)
  //   })
  // }

  // async startBotManagerByOrderId(id: string) {
  //   const farmManageData = await this.farmRepository.getFarmById(id)
  //   if (!farmManageData.isOpen) {
  //     return
  //   }
  //   this.logger.log('Start farm ==>', id)
  //   switch (farmManageData.currentTask) {
  //     case BotManagerTask.CHECK_PRICE:
  //       await this.checkPriceByOrderId(id)
  //       this.startBotManagerByOrderId(id)
  //       break
  //     default:
  //       this.logger.log(`Don't have management for task ${farmManageData.currentTask}`)
  //       return
  //   }
  // }

  async checkPriceByOrderId(orderId: string) {
    this.logger.debug('go to watcher')
    this.botManagerTaskService.emitBotManagerTask(orderId, BotManagerTask.CHECK_PRICE)
    // let isLoopInterval = true

    // const farmManageData = await this.farmRepository.getFarmById(id)
    // if (farmManageData.platform === FarmPlatForm.LATTE_SWAP) {
    //   const farmData = this.latteswapService.lpData[farmManageData.name] ?? null
    //   if (!farmData) {
    //     throw new NotFoundException(
    //       `Don't have farm name ${farmManageData.name} in platform ${farmManageData.platform}`
    //     )
    //   }
    //   const tokenAData = this.utilsService.getTokenData(farmData.tokenA)
    //   const tokenBData = this.utilsService.getTokenData(farmData.tokenB)
    //   const stopLossFarmUsd = farmManageData.cutLossValueUsd ?? undefined
    //   if (!stopLossFarmUsd) {
    //     this.logger.error(` For farm id ${id} Not found cutLossValueUsd in DB`)
    //     return
    //   }
    //   while (isLoopInterval) {
    //     try {
    //       const isTaskRunEvent = this.config.get(`farm.tasks.${id}.isRunEvent`)
    //       this.logger.debug(`isTaskRunEvent ${id} | ${isTaskRunEvent}`)
    //       if (!isTaskRunEvent) {
    //         this.config.set(`farm.tasks.${id}.isRunEvent`, false)
    //         isLoopInterval = false
    //         break
    //       }

    //       const tokenPairsAmountFromLpToken = await this.latteswapService.getTokenPairsAmountFromLpToken(
    //         farmManageData.name
    //       )
    //       this.logger.debug(`tokenPairsAmountFromLpToken ${JSON.stringify(tokenPairsAmountFromLpToken, null, 4)}`)
    //       const rateLatteVolume = await this.wardenSwapServeice.getRate(
    //         tokenAData.address,
    //         tokenBData.address,
    //         tokenPairsAmountFromLpToken.tokenAAmount
    //       )
    //       const ltokenAUsdVolume = ethers.utils.formatUnits(rateLatteVolume.amountOut, tokenAData.decimals).toString()
    //       const tokenBUsdVolume = ethers.utils
    //         .formatUnits(tokenPairsAmountFromLpToken.tokenBAmount, tokenBData.decimals)
    //         .toString()
    //       const allUsd = new BigNumber(ltokenAUsdVolume).plus(tokenBUsdVolume).toFixed(2)
    //       this.logger.debug(`allUsd ${allUsd}`)
    //       this.logger.debug(`stopLossFarmUsd ${stopLossFarmUsd}`)

    //       if (new BigNumber(allUsd).lt(stopLossFarmUsd)) {
    //         this.logger.debug('Go to exit farm')
    //         await this.farmRepository.updateFarmById(id, { currentTask: FarmTask.EXIT_FARM })
    //         isLoopInterval = false
    //         this.config.set(`farm.tasks.${id}.isRunEvent`, false)
    //         break
    //       }
    //       // Wait 10s before next round
    //       await this.utilsService.delay(1000 * 10)
    //     } catch (error) {
    //       this.logger.debug(`watcherFarmId Error ${error.message}`)
    //       isLoopInterval = false
    //       this.logger.log('Delay 15s')
    //       this.utilsService.delay(1000 * 15)
    //       break
    //     }
    //   }
    // }
  }

  // async initFarmById(id: string) {
  //   this.logger.debug(`init Farm ${id}`)
  //   this.farmTeskService.emitFarmTask(id, FarmTask.INIT_FARM)

  //   const farmManageData = await this.farmRepository.getFarmById(id)
  //   if (farmManageData.platform === FarmPlatForm.LATTE_SWAP) {
  //     const earnLpToken = await this.latteswapService.initFarm(id, farmManageData.initValueUsd)
  //     await this.farmRepository.updateFarmById(id, { currentTask: FarmTask.WATCHER_FARM, lpTokenAmount: earnLpToken })
  //     this.farmTeskService.daleteFarmTask(id)
  //   }
  // }

  // async exitFarmById(id: string) {
  //   this.logger.debug(`exitFarmById ${id}`)
  //   const farmManageData = await this.farmRepository.getFarmById(id)
  //   let exitFarmValueUsd: number
  //   if (farmManageData.platform === FarmPlatForm.LATTE_SWAP) {
  //     exitFarmValueUsd = await this.latteswapService.ejectFarm(id)
  //   }
  //   await this.farmRepository.updateFarmById(id, { exitFarmValueUsd: exitFarmValueUsd, isOpen: false })
  //   this.logger.log(`Exit farm by id ${id} success..`)
  // }
}
