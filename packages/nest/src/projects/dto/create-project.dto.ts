import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateProjectDto {
  @IsNotEmpty({ message: '项目名称不能为空' })
  @IsString()
  projectName: string

  @IsOptional()
  @IsString()
  content?: string

  @IsNotEmpty({ message: '用户ID不能为空' })
  @IsInt()
  userId: number
}
