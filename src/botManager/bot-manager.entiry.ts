import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { OrderType, OrderStatus } from './interfaces/bot-manager.interface'

@Entity()
export class OrderEntity {
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
  type: OrderType

  @Column()
  status: OrderStatus

  @Column()
  tragetPrice: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
