import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { User } from '../../users/entities/user.entity'

@Entity()
export class Project {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  projectName: string

  @Column({ type: 'text', nullable: true })
  content: string

  @Column({ type: 'text', nullable: true })
  description: string

  @ManyToOne(() => User)
  user: User

  @Column()
  userId: number

  @Column({ default: false })
  isDeleted: boolean

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
