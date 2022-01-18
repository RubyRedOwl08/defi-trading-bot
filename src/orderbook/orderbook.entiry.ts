import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { OrderbookType, OrderbookStatus } from './interfaces/orderbook.interface'

@Entity()
export class OrderbookEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ nullable: true })
  description: string

  @Column()
  srcTokenAddress: string

  @Column()
  srcTokenSymbol: string

  @Column()
  descTokenAddress: string

  @Column()
  descTokenSymbol: string

  @Column()
  type: OrderbookType

  @Column()
  status: OrderbookStatus

  @Column()
  tragetPrice: string

  @Column()
  activationPrice: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
