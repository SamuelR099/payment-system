import { DomainError } from 'src/shared/domain';
import { BlockchainNetwork } from 'src/shared/enums/blockchain-network.enum';
import { PaymentStatus } from 'src/shared/enums/payment-status.enum';

export class Payment {
  readonly id: string;
  readonly userId: string;
  readonly reportId: string;

  readonly network: BlockchainNetwork;
  readonly walletAddress: string;

  readonly amountExpected: number;
  readonly amountReceived: number;

  readonly txid: string | null;

  readonly status: PaymentStatus;

  readonly confirmations: number;

  readonly detectedAt: Date | null;
  readonly paidAt: Date | null;
  readonly expiresAt: Date;

  readonly rawBlockchainData: Record<string, any> | null;

  readonly createdAt: Date;
  readonly updatedAt: Date;

  private constructor(params: {
    id: string;
    userId: string;
    reportId: string;
    network: BlockchainNetwork;
    walletAddress: string;
    amountExpected: number;
    amountReceived: number;
    txid: string | null;
    status: PaymentStatus;
    confirmations: number;
    detectedAt: Date | null;
    paidAt: Date | null;
    expiresAt: Date;
    rawBlockchainData: Record<string, any> | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = params.id;
    this.userId = params.userId;
    this.reportId = params.reportId;
    this.network = params.network;
    this.walletAddress = params.walletAddress;
    this.amountExpected = params.amountExpected;
    this.amountReceived = params.amountReceived;
    this.txid = params.txid;
    this.status = params.status;
    this.confirmations = params.confirmations;
    this.detectedAt = params.detectedAt;
    this.paidAt = params.paidAt;
    this.expiresAt = params.expiresAt;
    this.rawBlockchainData = params.rawBlockchainData;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
  }

  static create(params: {
    id?: string;
    userId: string;
    reportId: string;
    network: BlockchainNetwork;
    walletAddress: string;
    amountExpected: number;
    expiresAt: Date;
  }): Payment {
    const now = new Date();
    return new Payment({
      id: params.id ?? '',
      userId: params.userId,
      reportId: params.reportId,
      network: params.network,
      walletAddress: params.walletAddress,
      amountExpected: params.amountExpected,
      amountReceived: 0,
      txid: null,
      status: PaymentStatus.PENDING,
      confirmations: 0,
      detectedAt: null,
      paidAt: null,
      expiresAt: params.expiresAt,
      rawBlockchainData: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  static fromModel(document: any): Payment {
    return new Payment({
      id: document._id?.toString?.() ?? '',
      userId: String(document.userId),
      reportId: String(document.reportId),
      network: document.network,
      walletAddress: document.walletAddress,
      amountExpected: document.amountExpected,
      amountReceived: document.amountReceived ?? 0,
      txid: document.txid ?? null,
      status: document.status,
      confirmations: document.confirmations ?? 0,
      detectedAt: document.detectedAt ?? null,
      paidAt: document.paidAt ?? null,
      expiresAt: document.expiresAt,
      rawBlockchainData: document.rawBlockchainData ?? null,
      createdAt: document.createdAt ?? new Date(),
      updatedAt: document.updatedAt ?? new Date(),
    });
  }

  getUserInfo() {
    return {
      id: this.id,
      userId: this.userId,
      reportId: this.reportId,
      network: this.network,
      walletAddress: this.walletAddress,
      amountExpected: this.amountExpected,
      amountReceived: this.amountReceived,
      txid: this.txid,
      status: this.status,
      confirmations: this.confirmations,
      detectedAt: this.detectedAt,
      paidAt: this.paidAt,
      expiresAt: this.expiresAt,
    };
  }

  isExpired(): boolean {
    return this.status === PaymentStatus.PENDING && new Date() > this.expiresAt;
  }

  canBeCompleted(): boolean {
    return this.status === PaymentStatus.PENDING && !this.isExpired();
  }

  canBeVerified(): boolean {
    return this.status === PaymentStatus.PENDING && !this.isExpired();
  }

  markAsCompleted(txid: string, amountReceived: number, rawBlockchainData?: Record<string, any>): Payment {
    if (!this.canBeCompleted()) {
      throw new DomainError(
        'INVALID_STATUS',
        'Solo se pueden completar pagos en estado pending y no expirados.',
      );
    }
    return new Payment({
      ...this,
      txid,
      amountReceived,
      status: PaymentStatus.COMPLETED,
      paidAt: new Date(),
      rawBlockchainData: rawBlockchainData ?? this.rawBlockchainData,
      updatedAt: new Date(),
    });
  }

  markAsExpired(): Payment {
    if (this.status !== PaymentStatus.PENDING) {
      throw new DomainError(
        'INVALID_STATUS',
        'Solo se pueden marcar como expirados pagos en estado pending.',
      );
    }
    return new Payment({
      ...this,
      status: PaymentStatus.EXPIRED,
      updatedAt: new Date(),
    });
  }

  markAsFailed(reason?: string): Payment {
    if (this.status !== PaymentStatus.PENDING) {
      throw new DomainError(
        'INVALID_STATUS',
        'Solo se pueden marcar como fallidos pagos en estado pending.',
      );
    }
    return new Payment({
      ...this,
      status: PaymentStatus.FAILED,
      rawBlockchainData: { error: reason },
      updatedAt: new Date(),
    });
  }

  verifyTransaction(
    txid: string,
    amount: number,
    confirmations: number,
    tolerancePercent: number,
    minimumConfirmations: number,
    rawBlockchainData?: Record<string, any>,
  ): Payment {
    if (!this.canBeVerified()) {
      throw new DomainError(
        'INVALID_STATUS',
        'No se puede verificar un pago que no está pending o está expirado.',
      );
    }

    const tolerance = this.amountExpected * (tolerancePercent / 100);
    const minAmount = this.amountExpected - tolerance;
    const maxAmount = this.amountExpected + tolerance;

    if (amount < minAmount || amount > maxAmount) {
      throw new DomainError(
        'INVALID_AMOUNT',
        `El monto ${amount} no está dentro del rango aceptable [${minAmount}, ${maxAmount}].`,
      );
    }

    if (confirmations < minimumConfirmations) {
      throw new DomainError(
        'INSUFFICIENT_CONFIRMATIONS',
        `Se requieren al menos ${minimumConfirmations} confirmaciones.`,
      );
    }

    return new Payment({
      ...this,
      txid,
      amountReceived: amount,
      confirmations,
      status: PaymentStatus.PENDING,
      detectedAt: new Date(),
      rawBlockchainData: rawBlockchainData ?? this.rawBlockchainData,
      updatedAt: new Date(),
    });
  }

  updateConfirmations(confirmations: number): Payment {
    return new Payment({
      ...this,
      confirmations,
      updatedAt: new Date(),
    });
  }
}