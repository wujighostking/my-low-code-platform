import { IsNotEmpty, IsString } from 'class-validator'

export class LoginDto {
  @IsNotEmpty({ message: 'username 不能为空' })
  @IsString()
  username: string

  @IsNotEmpty({ message: 'password 不能为空' })
  @IsString()
  password: string
}
