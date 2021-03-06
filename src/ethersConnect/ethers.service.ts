import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  InjectEthersProvider,
  StaticJsonRpcProvider,
  Contract,
  InjectContractProvider,
  InjectSignerProvider,
  EthersContract,
  EthersSigner,
  Wallet
} from 'nestjs-ethers'
import { ethers } from 'ethers'
import { KMS } from 'aws-sdk'
import { InjectAwsService } from 'nest-aws-sdk'
import { getAddress, TransactionResponse, MaxUint256 } from 'nestjs-ethers'
import { DEFAULT_GAS_LIMIT_FOR_READ_METHOD, NETWORK_CONSTANT } from 'src/constants'
// import masterchefAbi from '../contracts/abis/masterchef.json'
import wardenRoutingAbi from '../contracts/abis/WardenRoutingAbi.json'
import erc20Abi from '../contracts/abis/erc20.json'
import { ApprovalState } from './interfaces/ethers.interface'
import { UtilsService } from 'src/utils/utils.service'
import { GenWalletType } from './interfaces/ethers.interface'

@Injectable()
export class EthersConnectService implements OnModuleInit {
  public wardenRoutingContract: Contract
  public botWalletAddress
  private wallet: Wallet
  private logger = new Logger('EthersConnectService')
  constructor(
    @InjectEthersProvider()
    public bscProvider: StaticJsonRpcProvider,
    @InjectContractProvider()
    public readonly contract: EthersContract,
    @InjectSignerProvider()
    private readonly signer: EthersSigner,
    @InjectAwsService(KMS)
    private kms: KMS,
    private configService: ConfigService,
    private utilsService: UtilsService
  ) {}

  async onModuleInit() {
    const wardenRoutingContractAddress = NETWORK_CONSTANT[56].WARDEN_ROUTING_CONTRACT_ADDRESS
    this.wallet = await this.manageWallet()
    this.botWalletAddress = await this.wallet.getAddress()
    this.logger.log(`Start bot for wallet address: ${this.botWalletAddress}`)
    this.wardenRoutingContract = this.getContract(wardenRoutingContractAddress, wardenRoutingAbi)
  }

  async getGasPrice() {
    const gasPrice = await this.bscProvider.getGasPrice()
    return { gasPrice: gasPrice.toString() }
  }

  getContract(contradtAddress: string, abi: any) {
    const contract: Contract = this.contract.create(contradtAddress, abi, this.wallet)
    return contract
  }

  getTokenContract(tokenAddress: string) {
    const tokenContractContract: Contract = this.contract.create(tokenAddress, erc20Abi, this.wallet)
    return tokenContractContract
  }

  async getBalanceOfToken(tokenContract: Contract) {
    const tokenBalanceInWei = (await tokenContract.balanceOf(this.botWalletAddress)).toString()
    return tokenBalanceInWei
  }

  async getBalanceOfTokenWithAddrss(tokenAddress: string) {
    const nativeToken = NETWORK_CONSTANT[56].NATIVE_TOKEN
    if (getAddress(tokenAddress) === getAddress(nativeToken.address)) {
      const nativeTokenBalanceInWei = (await this.wallet.getBalance()).toString()
      return nativeTokenBalanceInWei
    }

    const tokenContract = this.getTokenContract(tokenAddress)
    const tokenBalanceInWei = (await tokenContract.balanceOf(this.botWalletAddress)).toString()
    return tokenBalanceInWei
  }

  private getWallet(privateKey: string) {
    const wallet: Wallet = this.signer.createWallet(privateKey)
    return wallet
  }

  private async manageWallet() {
    const genWalletType = this.configService.get<GenWalletType>('USE_WALLET_TYPE')
    const tempFile = { walletPrivateKey: null, decryptResponse: null }

    switch (genWalletType) {
      case GenWalletType.PRIVATE_KEY:
        tempFile.walletPrivateKey = this.configService.get<string>('WALLET_PRIVATE_KEY')
        break
      case GenWalletType.ENCRYPT_BASE64: {
        const params = {
          CiphertextBlob: Buffer.from(this.configService.get<string>('WALLET_ENCRYPT_BASE64'), 'base64')
        }
        tempFile.decryptResponse = await this.utilsService.myPromise(this.kms, 'decrypt', params)
        tempFile.walletPrivateKey = tempFile.decryptResponse.Plaintext.toString('utf-8')
        break
      }
      default:
        throw new NotFoundException(`The system does not support ${genWalletType} wallet type.`)
    }
    const wallet = this.getWallet(tempFile.walletPrivateKey)

    // Remove from memory
    delete tempFile.decryptResponse
    delete tempFile.walletPrivateKey

    return wallet
  }

  public async checkIsAllowanced(
    userAddr: string,
    tokenAddress: string,
    spenderAddress: string
  ): Promise<ApprovalState> {
    const nativeToken = NETWORK_CONSTANT[56].NATIVE_TOKEN
    if (getAddress(tokenAddress) === getAddress(nativeToken.address)) {
      return ApprovalState.APPROVED
    }
    const tokenContract = this.getTokenContract(tokenAddress)
    const result = await tokenContract.allowance(userAddr, spenderAddress, {
      gasLimit: DEFAULT_GAS_LIMIT_FOR_READ_METHOD
    })
    if (result.isZero()) {
      return ApprovalState.NOT_APPROVED
    }

    return ApprovalState.APPROVED
  }

  async approveToken(tokenAddress: string, spenderAddress: string): Promise<TransactionResponse> {
    try {
      this.logger.log(`Approve ${tokenAddress} token`)
      const gasPrice = ethers.utils.parseUnits('5', 'gwei') // * For BSC chain
      const tokenContract = this.getTokenContract(tokenAddress)

      const estimatedGas = await this.utilsService.estimateGasForContract(tokenContract, 'approve', [
        spenderAddress,
        MaxUint256
      ])
      const transactionResponse: TransactionResponse = await tokenContract.approve(spenderAddress, MaxUint256, {
        gasLimit: estimatedGas,
        gasPrice: gasPrice
      })
      return transactionResponse
    } catch (error) {
      this.logger.error('Function approveToken', error)

      throw new Error(`Approve token error: ${error.message}`)
    }
  }
}
