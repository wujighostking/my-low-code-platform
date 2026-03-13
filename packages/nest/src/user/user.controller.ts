import type { User } from './user.entity'
import type { UserService } from './user.service'
import { Controller, Get } from '@nestjs/common'

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAll(): Promise<User[]> {
    return this.userService.findAll()
  }
}
