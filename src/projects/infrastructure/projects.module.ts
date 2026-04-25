import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';

import { Project, ProjectSchema } from './schemas/project.schema';
import { ProjectRepository } from './repositories/project.repository';
import { ProjectsController } from './projects.controller';

import { CreateProjectHandler } from '../application/create-project/create-project.handler';
import { UpdateProjectHandler } from '../application/update-project/update-project.handler';
import { DeleteProjectHandler } from '../application/delete-project/delete-project.handler';
import { GetProjectsHandler } from '../application/get-projects/get-projects.handler';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([{ name: Project.name, schema: ProjectSchema }]),
  ],
  controllers: [ProjectsController],
  providers: [
    ProjectRepository,
    CreateProjectHandler,
    UpdateProjectHandler,
    DeleteProjectHandler,
    GetProjectsHandler,
  ],
  exports: [ProjectRepository],
})
export class ProjectsModule {}
