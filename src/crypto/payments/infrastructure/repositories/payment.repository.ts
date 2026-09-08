import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Payment, PaymentDocument } from '../schemas/payment.schema';
import { PaymentStatus } from 'src/shared/enums/payment-status.enum';

@Injectable()
export class PaymentRepository {
  private readonly DEFAULT_PAGE_SIZE = 20;

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
    return this.paymentModel.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  async findByUserIdWithFilters(
    userId?: string,
    status?: string,
    excludeStatus?: string,
    cursor?: string,
    limit?: number,
  ) {
    const pageSize = limit ?? this.DEFAULT_PAGE_SIZE;
    const filter = this.buildFilter({
      userId,
      status,
      excludeStatus,
      cursor,
    });

    const data = await this.paymentModel
      .find(filter)
      .sort({ _id: -1 })
      .limit(pageSize)
      .lean()
      .exec();

    const mappedData = data.map(payment => ({
      ...payment,
      id: String(payment._id),
    }));

    const nextCursor =
      mappedData.length < pageSize
        ? null
        : String(mappedData[mappedData.length - 1]._id);

    return { data: mappedData, nextCursor };
  }

  async findLatestByUserIdWithFilters(params: {
    userId?: string;
    status?: string;
    excludeStatus?: string;
    limit: number;
  }) {
    const filter = this.buildFilter({
      userId: params.userId,
      status: params.status,
      excludeStatus: params.excludeStatus,
    });

    const data = await this.paymentModel
      .find(filter)
      .sort({ _id: -1 })
      .limit(params.limit)
      .lean()
      .exec();

    return data.map(payment => ({
      ...payment,
      id: String(payment._id),
    }));
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

  private buildFilter(params: {
    userId?: string;
    status?: string;
    excludeStatus?: string;
    cursor?: string;
  }) {
    const filter: any = { $and: [] };

    if (params.userId) {
      filter.$and.push({
        $or: [
          { userId: params.userId },
          { userId: new Types.ObjectId(params.userId) },
        ],
      });
    }

    if (params.status) {
      filter.$and.push({ status: params.status });
    }

    if (params.excludeStatus) {
      filter.$and.push({ status: { $ne: params.excludeStatus } });
    }

    if (params.cursor) {
      filter.$and.push({ _id: { $lt: new Types.ObjectId(params.cursor) } });
    }

    if (filter.$and.length === 0) {
      delete filter.$and;
    }

    return filter;
  }
}
