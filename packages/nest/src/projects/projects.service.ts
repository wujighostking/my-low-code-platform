import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CreateProjectDto } from './dto/create-project.dto'
import { UpdateProjectDto } from './dto/update-project.dto'
import { Project } from './entities/project.entity'

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  create(createProjectDto: CreateProjectDto, userId: number) {
    const project = this.projectRepository.create({ ...createProjectDto, userId })
    return this.projectRepository.save(project)
  }

  findByUserId(userId: number) {
    return this.projectRepository.find({ where: { userId, isDeleted: false }, order: { createdAt: 'DESC' } })
  }

  async findOne(id: number) {
    const project = await this.projectRepository.findOneBy({ id, isDeleted: false })
    if (!project) {
      throw new NotFoundException(`项目 #${id} 不存在`)
    }
    return project
  }

  async update(id: number, updateProjectDto: UpdateProjectDto) {
    const project = await this.findOne(id)
    Object.assign(project, updateProjectDto)
    return this.projectRepository.save(project)
  }

  async updateName(id: number, projectName: string) {
    const project = await this.findOne(id)
    project.projectName = projectName
    return this.projectRepository.save(project)
  }

  async remove(id: number) {
    const project = await this.findOne(id)
    project.isDeleted = true
    return this.projectRepository.save(project)
  }
}
