import { DomainError } from 'src/shared/domain';
import { ReportStatus } from './enums/report-status.enum';

export class Report {
  readonly id: string;
  readonly userId: string;
  readonly month: number;
  readonly year: number;
  readonly totalHours: number;
  readonly totalAmount: number;
  readonly status: ReportStatus;
  readonly employeeSigned: boolean;
  readonly employeeSignatureImage?: string;
  readonly employeeSignedAt?: Date;
  readonly adminSigned: boolean;
  readonly adminSignatureImage?: string;
  readonly adminSignedAt?: Date;
  readonly adminId?: string;

  private constructor(params: {
    id: string;
    userId: string;
    month: number;
    year: number;
    totalHours: number;
    totalAmount: number;
    status: ReportStatus;
    employeeSigned: boolean;
    employeeSignatureImage?: string;
    employeeSignedAt?: Date;
    adminSigned: boolean;
    adminSignatureImage?: string;
    adminSignedAt?: Date;
    adminId?: string;
  }) {
    this.id = params.id;
    this.userId = params.userId;
    this.month = params.month;
    this.year = params.year;
    this.totalHours = params.totalHours;
    this.totalAmount = params.totalAmount;
    this.status = params.status;
    this.employeeSigned = params.employeeSigned;
    this.employeeSignatureImage = params.employeeSignatureImage;
    this.employeeSignedAt = params.employeeSignedAt;
    this.adminSigned = params.adminSigned;
    this.adminSignatureImage = params.adminSignatureImage;
    this.adminSignedAt = params.adminSignedAt;
    this.adminId = params.adminId;
  }

  static create(params: {
    id: string;
    userId: string;
    month: number;
    year: number;
    totalHours: number;
    totalAmount: number;
  }): Report {
    return new Report({
      id: params.id,
      userId: params.userId,
      month: params.month,
      year: params.year,
      totalHours: params.totalHours,
      totalAmount: params.totalAmount,
      status: ReportStatus.DRAFT,
      employeeSigned: false,
      adminSigned: false,
    });
  }

  signByEmployee(signatureImage: string): Report {
    if (this.status !== ReportStatus.SUBMITTED) {
      throw new DomainError('INVALID_STATUS', 'El reporte debe estar en estado submitted para ser firmado.');
    }
    return new Report({
      ...this,
      employeeSigned: true,
      employeeSignatureImage: signatureImage,
      employeeSignedAt: new Date(),
      status: ReportStatus.SIGNED_BY_EMPLOYEE,
    });
  }

  approveByAdmin(adminId: string, signatureImage: string): Report {
    if (this.status !== ReportStatus.SIGNED_BY_EMPLOYEE) {
      throw new DomainError('INVALID_STATUS', 'El reporte debe estar firmado por el empleado antes de ser aprobado.');
    }
    return new Report({
      ...this,
      adminSigned: true,
      adminSignatureImage: signatureImage,
      adminSignedAt: new Date(),
      adminId,
      status: ReportStatus.APPROVED,
    });
  }
}
