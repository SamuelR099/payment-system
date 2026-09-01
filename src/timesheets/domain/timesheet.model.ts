import { DomainError } from 'src/shared/domain';
import { parseLocalDate } from 'src/shared/utils';

export interface Timesheet {
  id: string;
  userId: string;
  date: Date;
  project: string;
  description: string;
  hours: number;
  createdAt: Date;
  updatedAt: Date;
}

export class TimesheetModel {
  readonly id: string;
  readonly userId: string;
  readonly date: Date;
  readonly project: string;
  readonly description: string;
  readonly hours: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(params: {
    id: string;
    userId: string;
    date: Date;
    project: string;
    description: string;
    hours: number;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = params.id;
    this.userId = params.userId;
    this.date = params.date;
    this.project = params.project;
    this.description = params.description;
    this.hours = params.hours;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
  }

  static create(params: {
    userId: string;
    date: string | Date;
    project: string;
    description: string;
    hours: number;
  }) {
    if (!params.userId)
      throw new DomainError('USER_ID_REQUIRED', 'El usuario es obligatorio.');
    if (!params.project)
      throw new DomainError('PROJECT_REQUIRED', 'El proyecto es obligatorio.');
    if (!params.description)
      throw new DomainError(
        'DESCRIPTION_REQUIRED',
        'La descripción es obligatoria.',
      );
    const date = parseLocalDate(params.date);
    return new TimesheetModel({
      id: '',
      userId: params.userId,
      date,
      project: params.project,
      description: params.description,
      hours: params.hours,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  update(data: Partial<Omit<Timesheet, 'id' | 'userId'>>) {
    return new TimesheetModel({
      ...this,
      date: data.date ? parseLocalDate(data.date) : this.date,
      project: data.project ?? this.project,
      description: data.description ?? this.description,
      hours: data.hours ?? this.hours,
      updatedAt: new Date(),
    });
  }

  static fromModel(document: any) {
    return new TimesheetModel({
      id: document._id?.toString?.() ?? '',
      userId: document.userId?.toString?.() ?? '',
      date: document.date,
      project: document.project,
      description: document.description,
      hours: document.hours,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    });
  }

  getUserInfo(): Timesheet {
    return {
      id: this.id,
      userId: this.userId,
      date: this.date,
      project: this.project,
      description: this.description,
      hours: this.hours,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  get monthYear() {
    return {
      month: this.date.getMonth() + 1,
      year: this.date.getFullYear(),
    };
  }
}
