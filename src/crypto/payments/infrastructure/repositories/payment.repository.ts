import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Payment, PaymentDocument } from '../schemas/payment.schema';
import { PaymentStatus } from 'src/shared/enums/payment-status.enum';
import { DEFAULT_PAGE_SIZE } from 'src/shared/constants';

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
    return this.paymentModel.findOne({ reportId }).exec();
  }

  async findByTxid(txid: string) {
    return this.paymentModel.findOne({ txid }).exec();
  }

  async findByTxids(txids: string[]) {
    return this.paymentModel.find({ txid: { $in: txids } }).lean().exec();
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

  async findByUserIdWithFilters(params: {
    userId?: string;
    status?: string;
    excludeStatus?: string;
    cursor?: string;
  }) {
    const query = this.paymentModel.find().sort({ _id: -1 });

    this.applyFilters(query, params);

    const payments = await query.limit(DEFAULT_PAGE_SIZE + 1).exec();

    let nextCursor: string | null = null;
    if (payments.length > DEFAULT_PAGE_SIZE) {
      payments.pop();
      const lastItem = payments[payments.length - 1];
      nextCursor = lastItem.id;
    }

    const data = payments.map(payment => {
      const paymentObj = payment.toObject();
      return { ...paymentObj, id: payment.id };
    });

    return { data, nextCursor };
  }

  async findLatestByUserIdWithFilters(params: {
    userId?: string;
    status?: string;
    excludeStatus?: string;
    limit: number;
  }) {
    const query = this.paymentModel.find().sort({ _id: -1 });

    this.applyFilters(query, params);

    const payments = await query.limit(params.limit).exec();

    return payments.map(payment => {
      const paymentObj = payment.toObject();
      return { ...paymentObj, id: payment.id };
    });
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

  async updateStatus(
    id: string,
    status: PaymentStatus,
    additionalData?: Partial<Payment>,
  ) {
    return this.updateById(id, { status, ...additionalData });
  }

  async markAsCompleted(
    id: string,
    txid: string,
    amountReceived: number,
    rawBlockchainData: Record<string, any>,
  ) {
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

  async expirePendingBefore(date: Date) {
    return this.paymentModel
      .updateMany(
        { status: PaymentStatus.PENDING, expiresAt: { $lt: date } },
        { $set: { status: PaymentStatus.EXPIRED } },
      )
      .exec();
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

  private applyFilters(
    query: any,
    params: {
      userId?: string;
      status?: string;
      excludeStatus?: string;
      cursor?: string;
    },
  ) {
    if (params.userId) {
      query.merge({
        $or: [
          { userId: params.userId },
          { userId: new Types.ObjectId(params.userId) },
        ],
      });
    }

    if (params.status) {
      query.merge({ status: params.status });
    }

    if (params.excludeStatus) {
      query.merge({ status: { $ne: params.excludeStatus } });
    }

    if (params.cursor && Types.ObjectId.isValid(params.cursor)) {
      query.merge({ _id: { $lt: new Types.ObjectId(params.cursor) } });
    }
  }
}
