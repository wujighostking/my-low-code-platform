import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UsersService } from '../users/users.service'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()

    const authorization = request.headers.authorization
    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException('用户未验证')
    }

    const token = authorization.slice(7)
    try {
      const payload = this.jwtService.verify(token)
      const user = await this.usersService.findByUsername(payload.username)
      if (!user) {
        throw new UnauthorizedException('用户不存在')
      }
      request.user = { id: user.id, username: user.username }
      return true
    }
    catch {
      throw new UnauthorizedException('验证不通过')
    }
  }
}
