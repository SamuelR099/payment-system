import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

import { CreateProjectCommand } from '../application/commands/create-project/create-project.command';
import { UpdateProjectCommand } from '../application/commands/update-project/update-project.command';
import { DeleteProjectCommand } from '../application/commands/delete-project/delete-project.command';
import { GetProjectsQuery } from '../application/queries/get-projects/get-projects.query';

@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('/')
  getProjects(@Req() req: any) {
    return this.queryBus.execute(new GetProjectsQuery(req.user.userId));
  }

  @Post('/')
  createProject(@Req() req: any, @Body() body: CreateProjectDto) {
    return this.commandBus.execute(
      new CreateProjectCommand({
        userId: req.user.userId,
        ...body
      })
    );
  }

  @Put('/:id')
  updateProject(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: UpdateProjectDto,
  ) {
    return this.commandBus.execute(
      new UpdateProjectCommand({
        projectId: id,
        userId: req.user.userId,
        ...body
      })
    );
  }

  @Delete('/:id')
  deleteProject(@Req() req: any, @Param('id') id: string) {
    return this.commandBus.execute(
      new DeleteProjectCommand({
        projectId: id,
        userId: req.user.userId
      })
    );
  }
}
