import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateProjectDto {
  @IsNotEmpty({ message: '项目名称不能为空' })
  @IsString()
  projectName: string

  @IsOptional()
  @IsString()
  content?: string

  @IsOptional()
  @IsString()
  description?: string
}
