import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { CreateUserDto } from '../users/dto/create-user.dto'
import { UsersService } from '../users/users.service'
import { LoginDto } from './dto/login.dto'

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByUsername(loginDto.username)
    if (!user || user.password !== loginDto.password) {
      throw new UnauthorizedException('用户名或密码错误')
    }
    return this.generateToken(user)
  }

  async register(createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto)
    return this.generateToken(user)
  }

  private generateToken(user: { id: number, username: string }) {
    const payload = { username: user.username, sub: user.id }
    return { access_token: this.jwtService.sign(payload) }
  }
}
