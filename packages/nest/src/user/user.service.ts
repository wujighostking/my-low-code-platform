import type { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from './user.entity'

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async onModuleInit(): Promise<void> {
    const count = await this.userRepository.count()
    if (count === 0) {
      await this.userRepository.save([
        { username: 'alice', password: '123456' },
        { username: 'bob', password: '654321' },
      ])
    }
  }

  findAll(): Promise<User[]> {
    return this.userRepository.find()
  }
}
