import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common'
import { CreateUserDto } from '../users/dto/create-user.dto'
import { AuthGuard } from './auth.guard'
import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto)
  }

  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto)
  }

  @Get('check')
  @UseGuards(AuthGuard)
  check(@Req() req: { user: { id: number, username: string } }) {
    return req.user
  }
}
