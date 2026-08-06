import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BlockchainNetwork } from 'src/shared/enums/blockchain-network.enum';
import { PaymentStatus } from 'src/shared/enums/payment-status.enum';

@Schema({ collection: 'payments', timestamps: true })
export class Payment {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  reportId: string;

  @Prop({ required: true, enum: BlockchainNetwork })
  network: BlockchainNetwork;

  @Prop({ required: true })
  walletAddress: string;

  @Prop({ required: true, min: 0 })
  amountExpected: number;

  @Prop({ default: 0, min: 0 })
  amountReceived: number;

  @Prop({ required: false })
  txid: string;

  @Prop({ required: true, enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Prop({ default: 0, min: 0 })
  confirmations: number;

  @Prop({ type: Date, required: false })
  detectedAt: Date;

  @Prop({ type: Date, required: false })
  paidAt: Date;

  @Prop({ required: true, type: Date })
  expiresAt: Date;

  @Prop({ type: Object, required: false })
  rawBlockchainData: Record<string, any>;
}

export type PaymentDocument = Payment & Document;

export const PaymentSchema = SchemaFactory.createForClass(Payment);

PaymentSchema.index({ userId: 1, status: 1 });
PaymentSchema.index({ reportId: 1 }, { unique: true });
PaymentSchema.index({ txid: 1 }, { sparse: true });
PaymentSchema.index({ expiresAt: 1, status: 1 });
PaymentSchema.index({ walletAddress: 1, network: 1 });
