import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { User } from '../../users/entities/user.entity'

@Entity()
export class Project {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  projectName: string

  @Column({ type: 'text', nullable: true })
  content: string

  @ManyToOne(() => User)
  user: User

  @Column()
  userId: number

  @Column({ default: false })
  isDeleted: boolean
}
