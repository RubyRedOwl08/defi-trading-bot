import { Test, TestingModule } from '@nestjs/testing'
import { UtilsService } from './utils.service'

describe('UtilsService', () => {
  let service: UtilsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UtilsService]
    }).compile()

    service = module.get<UtilsService>(UtilsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('Search with symbol', () => {
    expect(service.getTokenData('busd')).toEqual({
      name: 'BUSD Token',
      symbol: 'BUSD',
      address: '0xe9e7cea3dedca5984780bafc599bd69add087d56',
      chainId: 56,
      decimals: 18
    })
  })

  it('Search with adderss', () => {
    expect(service.getTokenData('0xe9e7cea3dedca5984780bafc599bd69add087d56')).toEqual({
      name: 'BUSD Token',
      symbol: 'BUSD',
      address: '0xe9e7cea3dedca5984780bafc599bd69add087d56',
      chainId: 56,
      decimals: 18
    })
  })
})
