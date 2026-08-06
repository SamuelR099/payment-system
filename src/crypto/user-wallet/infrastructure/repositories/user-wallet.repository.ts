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
    const userIdStr = String(userId);
    const query: any = {
      $or: [{ userId: userIdStr }],
    };
    if (Types.ObjectId.isValid(userIdStr)) {
      query.$or.push({ userId: new Types.ObjectId(userIdStr) });
    }
    const wallets = await this.userWalletModel.find(query).lean().exec();
    return wallets.map(wallet => ({ ...wallet, id: String(wallet._id) }));
  }

  async findByUserIds(userIds: string[]) {
    const objectIds = userIds
      .filter(id => Types.ObjectId.isValid(id))
      .map(id => new Types.ObjectId(id));
    if (objectIds.length === 0) return [];
    const wallets = await this.userWalletModel
      .find({
        userId: { $in: objectIds },
        isDefault: true,
        status: WalletStatus.ACTIVE,
      })
      .select('userId')
      .lean()
      .exec();
    return wallets.map(wallet => ({ ...wallet, id: String(wallet._id) }));
  }

  async findDefaultWallet(userId: string, network: BlockchainNetwork) {
    const wallet = await this.userWalletModel
      .findOne({
        userId: new Types.ObjectId(userId),
        network,
        isDefault: true,
        status: WalletStatus.ACTIVE,
      })
      .lean()
      .exec();
    return wallet ? { ...wallet, id: String(wallet._id) } : null;
  }

  async findDefaultWalletByUserId(userId: string) {
    const wallet = await this.userWalletModel
      .findOne({
        userId: new Types.ObjectId(userId),
        isDefault: true,
        status: WalletStatus.ACTIVE,
      })
      .lean()
      .exec();
    return wallet ? { ...wallet, id: String(wallet._id) } : null;
  }

  async updateDefaultStatus(
    userId: string,
    network: BlockchainNetwork,
    excludeWalletId: string,
  ) {
    await this.userWalletModel
      .updateMany(
        {
          userId: new Types.ObjectId(userId),
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

  validateWalletAddress(
    address: string,
    network: BlockchainNetwork,
  ): { valid: boolean; reason?: string } {
    if (network === BlockchainNetwork.TRC20) {
      if (!address.startsWith('T')) {
        return {
          valid: false,
          reason: 'la dirección TRC20 debe comenzar con "T"',
        };
      }
      if (address.length !== 34) {
        return {
          valid: false,
          reason: `la dirección TRC20 debe tener 34 caracteres (tiene ${address.length})`,
        };
      }
      return { valid: true };
    }

    if (network === BlockchainNetwork.BEP20) {
      if (!address.startsWith('0x')) {
        return {
          valid: false,
          reason: 'la dirección BEP20 debe comenzar con "0x"',
        };
      }
      if (address.length !== 42) {
        return {
          valid: false,
          reason: `la dirección BEP20 debe tener 42 caracteres (tiene ${address.length})`,
        };
      }
      return { valid: true };
    }

    return { valid: false, reason: `red no soportada: ${network}` };
  }
}
