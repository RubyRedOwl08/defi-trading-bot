import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class TradebookEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  transactionHash

  @Column()
  executionDestAmountOutBase

}
