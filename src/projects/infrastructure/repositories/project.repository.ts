import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Project, ProjectDocument } from '../schemas/project.schema';
import { DEFAULT_PAGE_SIZE } from 'src/shared/constants';

export type SearchProjectsParams = {
  userId: string;
  cursor?: string;
};

@Injectable()
export class ProjectRepository {
  constructor(
    @InjectModel(Project.name)
    private readonly projectModel: Model<ProjectDocument>,
  ) {}

  async search(params: SearchProjectsParams) {
    const query = this.projectModel
      .find({ userId: new Types.ObjectId(params.userId) })
      .sort({ _id: -1 });

    if (params.cursor && Types.ObjectId.isValid(params.cursor)) {
      query.merge({ _id: { $lt: new Types.ObjectId(params.cursor) } });
    }

    const projects = await query.limit(DEFAULT_PAGE_SIZE + 1).exec();

    let nextCursor: string | null = null;
    if (projects.length > DEFAULT_PAGE_SIZE) {
      projects.pop();
      const lastItem = projects[projects.length - 1];
      nextCursor = lastItem.id;
    }

    return { data: projects, nextCursor };
  }

  async create(data: { userId: string; name: string; description: string }) {
    const created = await this.projectModel.create({
      userId: new Types.ObjectId(data.userId),
      name: data.name,
      description: data.description,
    });
    return created.toObject();
  }

  async update(
    id: string,
    userId: string,
    data: Partial<{ name: string; description: string }>,
  ) {
    const updated = await this.projectModel
      .findOneAndUpdate(
        { _id: new Types.ObjectId(id), userId: new Types.ObjectId(userId) },
        { $set: data },
        { new: true },
      )
      .lean()
      .exec();

    if (!updated) throw new NotFoundException('Proyecto no encontrado.');

    return updated;
  }

  async delete(id: string, userId: string) {
    const result = await this.projectModel.deleteOne({
      _id: new Types.ObjectId(id),
      userId: new Types.ObjectId(userId),
    });
  }
}
