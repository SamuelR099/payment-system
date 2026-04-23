import { TimesheetDocument } from '../infrastructure/schemas/timesheet.schema';

type ExtendedTimesheetDocument = TimesheetDocument & {
  createdAt?: Date;
  updatedAt?: Date;
};

export class Timesheet {
  readonly id: string;
  readonly userId: string;
  readonly date: Date;
  readonly project: string;
  readonly description: string;
  readonly hours: number;
  readonly hourlyRate: number;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;

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

  // Valida que la fecha no sea futura
  static validateDateIsNotFuture(date: Date) {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (date > today) {
      throw new Error('No se permite una fecha futura para el timesheet');
    }
  }

  // Actualiza los campos del timesheet (devuelve un nuevo Timesheet)
  update(data: Partial<Omit<Timesheet, 'id' | 'userId'>>) {
    return new Timesheet({
      id: this.id,
      userId: this.userId,
      date: data.date ?? this.date,
      project: data.project ?? this.project,
      description: data.description ?? this.description,
      hours: data.hours ?? this.hours,
      hourlyRate: data.hourlyRate ?? this.hourlyRate,
      createdAt: this.createdAt!,
      updatedAt: new Date(),
    });
  }

  toPrimitives(omitUserId = false) {
    const obj: any = {
      date: this.date,
      project: this.project,
      description: this.description,
      hours: this.hours,
      hourlyRate: this.hourlyRate,
    };
    if (!omitUserId) {
      obj.userId = this.userId;
    }
    return obj;
  }

  static fromModel(document: ExtendedTimesheetDocument): Timesheet {
    return new Timesheet({
      id: document._id.toString(),
      userId: document.userId.toString(),
      date: document.date,
      project: document.project,
      description: document.description,
      hours: document.hours,
      hourlyRate: document.hourlyRate,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    });
  }

  get formattedDate(): string {
    return this.date.toISOString().split('T')[0];
  }

  get monthYear(): { month: number; year: number } {
    return {
      month: this.date.getMonth() + 1,
      year: this.date.getFullYear(),
    };
  }
}
