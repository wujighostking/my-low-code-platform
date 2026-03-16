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

  create(createProjectDto: CreateProjectDto) {
    const project = this.projectRepository.create(createProjectDto)
    return this.projectRepository.save(project)
  }

  findAll() {
    return this.projectRepository.find()
  }

  async findOne(id: number) {
    const project = await this.projectRepository.findOneBy({ id })
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

  async remove(id: number) {
    const project = await this.findOne(id)
    return this.projectRepository.remove(project)
  }
}
