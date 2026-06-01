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
    const wallet = new this.userWalletModel(walletData);
    return wallet.save();
  }

  async findById(id: string) {
    return this.userWalletModel.findById(id).exec();
  }

  async findByUserId(userId: string) {
    return this.userWalletModel
      .find({ userId: new Types.ObjectId(userId) })
      .exec();
  }

  async findDefaultWallet(userId: string, network: BlockchainNetwork) {
    return this.userWalletModel
      .findOne({
        userId: new Types.ObjectId(userId),
        network,
        isDefault: true,
        status: WalletStatus.ACTIVE,
      })
      .exec();
  }

  async findDefaultWalletByUserId(userId: string) {
    return this.userWalletModel
      .findOne({
        userId: new Types.ObjectId(userId),
        isDefault: true,
        status: WalletStatus.ACTIVE,
      })
      .exec();
  }

  async updateDefaultStatus(userId: string, network: BlockchainNetwork, excludeWalletId: string) {
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
      .exec();
    if (!updated) {
      throw new NotFoundException(`Wallet '${id}' not found`);
    }
    return updated;
  }

  async deleteById(id: string) {
    const result = await this.userWalletModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  validateWalletAddress(address: string, network: BlockchainNetwork): { valid: boolean; reason?: string } {
    if (network === BlockchainNetwork.TRC20) {
      if (!address.startsWith('T')) {
        return { valid: false, reason: 'la dirección TRC20 debe comenzar con "T"' };
      }
      if (address.length !== 34) {
        return { valid: false, reason: `la dirección TRC20 debe tener 34 caracteres (tiene ${address.length})` };
      }
      return { valid: true };
    }

    if (network === BlockchainNetwork.BEP20) {
      if (!address.startsWith('0x')) {
        return { valid: false, reason: 'la dirección BEP20 debe comenzar con "0x"' };
      }
      if (address.length !== 42) {
        return { valid: false, reason: `la dirección BEP20 debe tener 42 caracteres (tiene ${address.length})` };
      }
      return { valid: true };
    }

    return { valid: false, reason: `red no soportada: ${network}` };
  }
}