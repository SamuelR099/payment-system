import { TimesheetDocument as BaseTimesheetDocument } from '../infrastructure/schemas/timesheet.schema';
import { DomainError } from 'src/shared/domain';

export type TimesheetDocument = BaseTimesheetDocument & {
  createdAt: Date;
  updatedAt: Date;
};
export interface Timesheet {
  id: string;
  userId: string;
  date: Date;
  project: string;
  description: string;
  hours: number;
  hourlyRate: number;
  createdAt: Date;
  updatedAt: Date;
}
export class TimesheetModel {
  static create(params: {
    userId: string;
    date: string | Date;
    project: string;
    description: string;
    hours: number;
    hourlyRate?: number;
  }) {
    if (!params.userId) throw new DomainError('USER_ID_REQUIRED', 'El usuario es obligatorio.');
    if (!params.project) throw new DomainError('PROJECT_REQUIRED', 'El proyecto es obligatorio.');
    if (!params.description) throw new DomainError('DESCRIPTION_REQUIRED', 'La descripción es obligatoria.');
    const date = params.date instanceof Date ? params.date : new Date(params.date);
    return new TimesheetModel({
      id: '',
      userId: params.userId,
      date,
      project: params.project,
      description: params.description,
      hours: params.hours,
      hourlyRate: params.hourlyRate ?? 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  readonly id: string;
  readonly userId: string;
  readonly date: Date;
  readonly project: string;
  readonly description: string;
  readonly hours: number;
  readonly hourlyRate: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly signed: boolean;
  readonly signedAt?: Date;

  constructor(params: {
    id: string;
    userId: string;
    date: Date;
    project: string;
    description: string;
    hours: number;
    hourlyRate: number;
    createdAt: Date;
    updatedAt: Date;
    signed?: boolean;
    signedAt?: Date;
  }) {
    this.id = params.id;
    this.userId = params.userId;
    this.date = params.date;
    this.project = params.project;
    this.description = params.description;
    this.hours = params.hours;
    this.hourlyRate = params.hourlyRate;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
    this.signed = params.signed ?? false;
    this.signedAt = params.signedAt;
  }

  sign(): TimesheetModel {
    if (this.signed) {
      throw new DomainError('ALREADY_SIGNED', 'El timesheet ya está firmado.');
    }
    return new TimesheetModel({
      ...this,
      signed: true,
      signedAt: new Date(),
      updatedAt: new Date(),
    });
  }

  update(data: Partial<Omit<Timesheet, 'id' | 'userId'>>) {
    return new TimesheetModel({
      id: this.id,
      userId: this.userId,
      date: data.date ? (data.date instanceof Date ? data.date : new Date(data.date)) : this.date,
      project: data.project ?? this.project,
      description: data.description ?? this.description,
      hours: data.hours ?? this.hours,
      hourlyRate: data.hourlyRate ?? this.hourlyRate,
      createdAt: this.createdAt,
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
      hourlyRate: document.hourlyRate,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
      signed: document.signed ?? false,
      signedAt: document.signedAt,
    });
  }
  // sign method removed


  get monthYear() {
    return {
      month: this.date.getMonth() + 1,
      year: this.date.getFullYear(),
    };
  }

  getUserInfo(): Timesheet {
    return {
      id: this.id,
      userId: this.userId,
      date: this.date,
      project: this.project,
      description: this.description,
      hours: this.hours,
      hourlyRate: this.hourlyRate ?? 0,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
