import { TimesheetDocument as BaseTimesheetDocument } from '../infrastructure/schemas/timesheet.schema';
import { DomainError } from 'src/shared/domain';

export class TimesheetDate {
  private constructor(public readonly value: Date) {}
  static create(date: string | Date) {
    if (!date) throw new DomainError('DATE_REQUIRED', 'La fecha es obligatoria.');
    const dateObj = date instanceof Date ? date : new Date(date);
    TimesheetDate.validateIsNotFuture(dateObj);
    return new TimesheetDate(dateObj);
  }
  static validateIsNotFuture(date: Date) {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (date > today) {
      throw new DomainError('INVALID_DATE', 'No se permite una fecha futura para el timesheet');
    }
  }
}
export class TimesheetHours {
  private constructor(public readonly value: number) {}

  static create(hours: number | null | undefined): TimesheetHours {
    return new TimesheetHours(hours ?? 0); // Devuelve un valor predeterminado
  }

  static validate(hours: number | TimesheetHours | null | undefined): TimesheetHours {
    return new TimesheetHours(hours instanceof TimesheetHours ? hours.value : hours ?? 0); // Simplifica la validación
  }
}

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
    const date = TimesheetDate.create(params.date);
    const hours = TimesheetHours.create(params.hours);
    return new TimesheetModel({
      id: '',
      userId: params.userId,
      date,
      project: params.project,
      description: params.description,
      hours,
      hourlyRate: params.hourlyRate ?? 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  readonly id: string;
  readonly userId: string;
  readonly date: TimesheetDate;
  readonly project: string;
  readonly description: string;
  readonly hours: TimesheetHours;
  readonly hourlyRate: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(params: {
    id: string;
    userId: string;
    date: TimesheetDate;
    project: string;
    description: string;
    hours: TimesheetHours;
    hourlyRate: number;
    createdAt: Date;
    updatedAt: Date;
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
  }

  update(data: Partial<Omit<Timesheet, 'id' | 'userId'>>) {
    return new TimesheetModel({
      id: this.id,
      userId: this.userId,
      date: data.date ? (data.date instanceof TimesheetDate ? data.date : TimesheetDate.create(data.date as any)) : this.date,
      project: data.project ?? this.project,
      description: data.description ?? this.description,
      hours: TimesheetHours.validate(data.hours) ?? this.hours,
      hourlyRate: data.hourlyRate ?? this.hourlyRate,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });
  }

  static fromModel(document: any) {
    return new TimesheetModel({
      id: document._id?.toString?.() ?? '',
      userId: document.userId?.toString?.() ?? '',
      date: TimesheetDate.create(document.date),
      project: document.project,
      description: document.description,
      hours: TimesheetHours.create(document.hours),
      hourlyRate: document.hourlyRate,
      createdAt: document.createdAt ?? new Date(),
      updatedAt: document.updatedAt ?? new Date(),
    });
  }


  get monthYear() {
    return {
      month: this.date.value.getMonth() + 1,
      year: this.date.value.getFullYear(),
    };
  }

  getUserInfo(): Timesheet {
    return {
      id: this.id,
      userId: this.userId,
      date: this.date.value,
      project: this.project,
      description: this.description,
      hours: this.hours?.value, // Ensure hours is not null
      hourlyRate: this.hourlyRate ?? 0, // Ensure hourlyRate is not null
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
