import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Payment, PaymentDocument } from '../schemas/payment.schema';
import { PaymentStatus } from 'src/shared/enums/payment-status.enum';

@Injectable()
export class PaymentRepository {
  constructor(
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,
  ) {}

  async create(paymentData: Partial<Payment>) {
    const payment = new this.paymentModel(paymentData);
    return payment.save();
  }

  async findById(id: string) {
    return this.paymentModel.findById(id).exec();
  }

  async findByReportId(reportId: string) {
    return this.paymentModel
      .findOne({ reportId: new Types.ObjectId(reportId) })
      .exec();
  }

  async findByTxid(txid: string) {
    return this.paymentModel.findOne({ txid }).exec();
  }

  async findPendingPayments() {
    return this.paymentModel
      .find({ status: PaymentStatus.PENDING })
      .sort({ createdAt: 1 })
      .exec();
  }

  async findPendingPaymentsByNetwork(network: string) {
    return this.paymentModel
      .find({
        status: PaymentStatus.PENDING,
        network,
      })
      .exec();
  }

  async findByUserId(userId: string) {
    return this.paymentModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async updateById(id: string, updateData: Partial<Payment>) {
    const updated = await this.paymentModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException(`Payment '${id}' not found`);
    }
    return updated;
  }

  async updateStatus(id: string, status: PaymentStatus, additionalData?: Partial<Payment>) {
    return this.updateById(id, { status, ...additionalData });
  }

  async markAsCompleted(id: string, txid: string, amountReceived: number, rawBlockchainData: Record<string, any>) {
    return this.updateById(id, {
      status: PaymentStatus.COMPLETED,
      txid,
      amountReceived,
      paidAt: new Date(),
      rawBlockchainData,
    });
  }

  async markAsExpired(id: string) {
    return this.updateById(id, {
      status: PaymentStatus.EXPIRED,
    });
  }

  async markAsFailed(id: string, reason?: string) {
    return this.updateById(id, {
      status: PaymentStatus.FAILED,
      rawBlockchainData: { error: reason },
    });
  }

  async updateConfirmations(id: string, confirmations: number) {
    return this.updateById(id, { confirmations });
  }

  async deleteById(id: string) {
    const result = await this.paymentModel.findByIdAndDelete(id).exec();
    return !!result;
  }
}
