import { OrderbookEntity } from 'src/orderbook/orderbook.entiry'
import {
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinTable
} from 'typeorm'
import { TradebookType } from './interfaces/tradebook.interface'

@Entity()
export class TradebookEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  transactionHash: string

  @Column()
  executionDestAmountOutBase: string

  @Column()
  executionDestAmountOutUsd: string

  @Column()
  executionPrice: string

  @Column()
  transactionFeeBase: string

  @Column()
  transactionFeeUsd: string

  @Column()
  tradeType: TradebookType

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @Column({ type: 'uuid', nullable: true })
  orderbookId: string

  @OneToOne(() => OrderbookEntity)
  @JoinTable({ name: 'orderbookId' })
  orderbook: OrderbookEntity
}
