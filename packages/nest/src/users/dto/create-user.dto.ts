import { IsNotEmpty, IsString, MinLength } from 'class-validator'

export class CreateUserDto {
  @IsNotEmpty({ message: 'username 不能为空' })
  @IsString()
  username: string

  @IsNotEmpty({ message: 'password 不能为空' })
  @IsString()
  @MinLength(6, { message: 'password 长度不能少于6位' })
  password: string
}
