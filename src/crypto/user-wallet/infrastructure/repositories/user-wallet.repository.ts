import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserWallet, UserWalletDocument } from '../schemas/user-wallet.schema';
import { BlockchainNetwork } from 'src/shared/enums/blockchain-network.enum';
import { WalletStatus } from 'src/shared/enums/wallet-status.enum';

@Injectable()
export class UserWalletRepository {
  constructor(
    @InjectModel(UserWallet.name)
    private readonly userWalletModel: Model<UserWalletDocument>,
  ) {}

  async create(walletData: Partial<UserWallet>) {
    const wallet = await this.userWalletModel.create(walletData);
    return { ...wallet.toObject(), id: String(wallet._id) };
  }

  async findById(id: string) {
    const wallet = await this.userWalletModel.findById(id).lean().exec();
    return wallet ? { ...wallet, id: String(wallet._id) } : null;
  }

  async findByUserId(userId: string) {
    const wallets = await this.userWalletModel
      .find(this.buildUserIdFilter(userId))
      .lean()
      .exec();
    return wallets.map(wallet => ({ ...wallet, id: String(wallet._id) }));
  }

  async existsActiveByUserId(userId: string) {
    const exists = await this.userWalletModel.exists({
      userId,
      status: WalletStatus.ACTIVE,
    });

    return !!exists;
  }

  async updateDefaultStatus(
    userId: string,
    network: BlockchainNetwork,
    excludeWalletId: string,
  ) {
    await this.userWalletModel
      .updateMany(
        {
          ...this.buildUserIdFilter(userId),
          network,
          _id: { $ne: new Types.ObjectId(excludeWalletId) },
        },
        { $set: { isDefault: false } },
      )
      .exec();
  }

  async updateById(id: string, updateData: Partial<UserWallet>) {
    const updated = await this.userWalletModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .lean()
      .exec();
    if (!updated) {
      throw new NotFoundException(`Wallet '${id}' not found`);
    }
    return { ...updated, id: String(updated._id) };
  }

  async deleteById(id: string) {
    const result = await this.userWalletModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  private buildUserIdFilter(userId: string) {
    const userIdStr = String(userId);
    const filter: any = { $or: [{ userId: userIdStr }] };

    if (Types.ObjectId.isValid(userIdStr)) {
      filter.$or.push({ userId: new Types.ObjectId(userIdStr) });
    }

    return filter;
  }
}
