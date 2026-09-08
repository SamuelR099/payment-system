import { DomainError } from 'src/shared/domain';
import { ReportStatus } from './enums/report-status.enum';

export class Report {
  readonly id: string;
  readonly userId: string;
  readonly supervisorId?: string;
  readonly month: number;
  readonly year: number;
  readonly totalHours: number;
  readonly totalAmount: number;
  readonly hourlyRate: number;
  readonly status: ReportStatus;
  readonly employeeSigned: boolean;
  readonly employeeSignatureImage?: string;
  readonly employeeSignedAt?: Date;
  readonly adminSigned: boolean;
  readonly adminSignatureImage?: string;
  readonly adminSignedAt?: Date;
  readonly adminId?: string;
  readonly pdfPath?: string;

  private constructor(params: {
    id: string;
    userId: string;
    supervisorId?: string;
    month: number;
    year: number;
    totalHours: number;
    totalAmount: number;
    hourlyRate: number;
    status: ReportStatus;
    employeeSigned: boolean;
    employeeSignatureImage?: string;
    employeeSignedAt?: Date;
    adminSigned: boolean;
    adminSignatureImage?: string;
    adminSignedAt?: Date;
    adminId?: string;
    pdfPath?: string;
  }) {
    this.id = params.id;
    this.userId = params.userId;
    this.supervisorId = params.supervisorId;
    this.month = params.month;
    this.year = params.year;
    this.totalHours = params.totalHours;
    this.totalAmount = params.totalAmount;
    this.hourlyRate = params.hourlyRate;
    this.status = params.status;
    this.employeeSigned = params.employeeSigned;
    this.employeeSignatureImage = params.employeeSignatureImage;
    this.employeeSignedAt = params.employeeSignedAt;
    this.adminSigned = params.adminSigned;
    this.adminSignatureImage = params.adminSignatureImage;
    this.adminSignedAt = params.adminSignedAt;
    this.adminId = params.adminId;
    this.pdfPath = params.pdfPath;
  }

  static fromModel(document: any): Report {
    return new Report({
      id: document._id?.toString?.() ?? '',
      userId: document.userId?.toString?.() ?? '',
      supervisorId: document.supervisorId?.toString?.(),
      month: document.month,
      year: document.year,
      totalHours: document.totalHours,
      totalAmount: document.totalAmount,
      hourlyRate: document.hourlyRate,
      status: document.status,
      employeeSigned: document.employeeSigned ?? false,
      employeeSignatureImage: document.employeeSignatureImage,
      employeeSignedAt: document.employeeSignedAt,
      adminSigned: document.adminSigned ?? false,
      adminSignatureImage: document.adminSignatureImage,
      adminSignedAt: document.adminSignedAt,
      adminId: document.adminId?.toString?.(),
      pdfPath: document.pdfPath,
    });
  }

  getUserInfo() {
    return {
      id: this.id,
      userId: this.userId,
      supervisorId: this.supervisorId,
      month: this.month,
      year: this.year,
      totalHours: this.totalHours,
      totalAmount: this.totalAmount,
      hourlyRate: this.hourlyRate,
      status: this.status,
      employeeSigned: this.employeeSigned,
      employeeSignatureImage: this.employeeSignatureImage,
      employeeSignedAt: this.employeeSignedAt,
      adminSigned: this.adminSigned,
      adminSignatureImage: this.adminSignatureImage,
      adminSignedAt: this.adminSignedAt,
      adminId: this.adminId,
      pdfPath: this.pdfPath,
    };
  }

  signByEmployee(signatureImage: string): Report {
    if (this.status !== ReportStatus.SUBMITTED) {
      throw new DomainError(
        'INVALID_STATUS',
        'El reporte debe estar en estado submitted para ser firmado.',
      );
    }
    return new Report({
      ...this,
      employeeSigned: true,
      employeeSignatureImage: signatureImage,
      employeeSignedAt: new Date(),
      status: ReportStatus.SIGNED_BY_EMPLOYEE,
    });
  }

  approveByAdmin(adminId: string, signatureImage?: string): Report {
    if (this.status !== ReportStatus.SIGNED_BY_EMPLOYEE) {
      throw new DomainError(
        'INVALID_STATUS',
        'El reporte debe estar firmado por el empleado antes de ser aprobado.',
      );
    }
    return new Report({
      ...this,
      adminSigned: true,
      adminSignatureImage: signatureImage ?? this.adminSignatureImage,
      adminSignedAt: new Date(),
      adminId,
      status: ReportStatus.APPROVED,
    });
  }

  reject(): Report {
    return new Report({
      ...this,
      status: ReportStatus.REJECTED,
    });
  }

  submit(): Report {
    if (this.status !== ReportStatus.DRAFT) {
      throw new DomainError(
        'INVALID_STATUS',
        'Solo los reportes en estado draft pueden ser enviados.',
      );
    }
    return new Report({
      ...this,
      status: ReportStatus.SUBMITTED,
    });
  }

  update(params: {
    totalHours?: number;
    totalAmount?: number;
    hourlyRate?: number;
    pdfPath?: string;
  }): Report {
    if (this.status !== ReportStatus.DRAFT && !params.pdfPath) {
      throw new DomainError(
        'INVALID_STATUS',
        'Solo se pueden editar reportes en estado draft.',
      );
    }
    return new Report({
      ...this,
      totalHours: params.totalHours ?? this.totalHours,
      totalAmount: params.totalAmount ?? this.totalAmount,
      hourlyRate: params.hourlyRate ?? this.hourlyRate,
      pdfPath: params.pdfPath ?? this.pdfPath,
    });
  }
}
