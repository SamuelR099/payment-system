import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Project, ProjectDocument } from '../schemas/project.schema';

@Injectable()
export class ProjectRepository {
  constructor(
    @InjectModel(Project.name)
    private readonly projectModel: Model<ProjectDocument>,
  ) {}

  async findAllByUser(userId: string): Promise<ProjectDocument[]> {
    return this.projectModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .lean()
      .exec() as unknown as ProjectDocument[];
  }

  async create(data: {
    userId: string;
    name: string;
    description: string;
  }): Promise<ProjectDocument> {
    const created = await this.projectModel.create({
      userId: new Types.ObjectId(data.userId),
      name: data.name,
      description: data.description,
    });
    return created.toObject() as ProjectDocument;
  }

  async update(
    id: string,
    userId: string,
    data: Partial<{ name: string; description: string }>,
  ): Promise<ProjectDocument> {
    const updated = await this.projectModel
      .findOneAndUpdate(
        { _id: new Types.ObjectId(id), userId: new Types.ObjectId(userId) },
        { $set: data },
        { new: true },
      )
      .lean()
      .exec();

    if (!updated) throw new NotFoundException('Proyecto no encontrado.');

    return updated as unknown as ProjectDocument;
  }

  async delete(id: string, userId: string): Promise<void> {
    const result = await this.projectModel.deleteOne({
      _id: new Types.ObjectId(id),
      userId: new Types.ObjectId(userId),
    });

    if (result.deletedCount === 0)
      throw new NotFoundException('Proyecto no encontrado.');
  }
}
